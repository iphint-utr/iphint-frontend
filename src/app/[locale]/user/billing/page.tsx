'use client';

import type { CheckoutOpenOptions, Paddle, PaddleEventData } from '@paddle/paddle-js';
import React, { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Crown } from 'lucide-react';
import { apiClient, getApiErrorMessage } from '@/lib/api';
import { formatPriceByCountry, isKoreanCountry } from '@/lib/currency';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  cancelPlanSubscription,
  fetchBillingPageData,
  resumeAutoRenew,
  resumeSubscription,
  upgradeSubscription,
} from '@/lib/store/slices/accountSlice';

type PlanTier = 'starter' | 'pro' | 'premium';
type BillingCycle = 'monthly' | 'annual';

interface Plan {
  tier: PlanTier;
  name: string;
  imageUploadLimit: number;
  alertLimit: number;
  pdfEnabled: boolean;
  weeklyEmailAlerts: boolean;
  features: string[];
  pricing: { monthly: number; annual: number };
}

interface BillingSnapshot {
  subscription: {
    id?: string;
    status: 'active' | 'trialing' | 'past_due' | 'paused' | 'cancelled' | 'expired' | 'pending';
    billingCycle: BillingCycle;
    grantSource?: 'paid' | 'trial' | 'referral';
    isTrial?: boolean;
    isTrialing?: boolean;
    isPastDue?: boolean;
    paddleManaged?: boolean;
    trialEndsAt?: string | null;
    trialDaysLeft?: number;
    activationDate?: string;
    currentPeriodEnd?: string;
    nextBillingDate?: string;
    cancelDate?: string;
    paddleStatus?: string;
  } | null;
  plan: Plan;
  credits?: number;
  alertsRemaining?: number;
  usage: {
    imagesUsedThisMonth: number;
    imageUploadLimit: number;
    alertLimit: number;
    pdfEnabled: boolean;
  };
}

interface BillingHistoryItem {
  _id: string;
  amount: number;
  currency: string;
  status: 'completed' | 'failed' | 'refunded';
  paddleTransactionId: string;
  createdAt: string;
}

const paddleEnvironment =
  (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT ?? process.env.NEXT_PUBLIC_PADDLE_ENV) === 'sandbox'
    ? 'sandbox'
    : 'production';
const paddleClientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN?.trim().replace(/^['"']|['"']$/g, '') || undefined;

const getPaymentErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'string') {
    const trimmed = error.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  if (error instanceof Error) {
    const trimmed = error.message.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return getApiErrorMessage(error, fallback);
};

export default function BillingPage() {
  const dispatch = useAppDispatch();
  const { plans, loading, error, savingPlan, cancelLoading, resumeLoading, resumeAutoRenewLoading, upgradeLoading, countryCode } = useAppSelector((state) => state.account.billing);
  const snapshot = useAppSelector((state) => state.account.subscription.data) as BillingSnapshot | null;
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<PlanTier | null>(null);
  const [updatePaymentLoading, setUpdatePaymentLoading] = useState(false);
  const [historyItems, setHistoryItems] = useState<BillingHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const paddleRef = useRef<Paddle | null>(null);
  const paddlePromiseRef = useRef<Promise<Paddle> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isKorean = isKoreanCountry(countryCode);

  const formatPrice = (usd: number) => {
    return formatPriceByCountry(usd, countryCode);
  };

  useEffect(() => {
    dispatch(fetchBillingPageData());
  }, [dispatch]);

  useEffect(() => {
    let active = true;
    const loadHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const response = await apiClient.get('/billing/history', { params: { page: 1, limit: 20 } });
        if (!active) return;
        setHistoryItems(Array.isArray(response.data?.items) ? response.data.items : []);
      } catch (err) {
        if (!active) return;
        setHistoryError(getPaymentErrorMessage(err, 'Could not load billing history.'));
      } finally {
        if (active) setHistoryLoading(false);
      }
    };

    void loadHistory();
    return () => {
      active = false;
    };
  }, []);

  const handlePaddleEvent = useCallback((event: PaddleEventData) => {
    if (event.name === 'checkout.completed') {
      setCheckoutPlan(null);
      setCheckoutError(null);
      // Poll until subscription is active and Paddle-managed
      let attempts = 0;
      const poll = () => {
        if (attempts >= 10) return;
        attempts++;
        pollTimerRef.current = setTimeout(async () => {
          const result = await dispatch(fetchBillingPageData());
          const sub = (result as { payload?: { snapshot?: BillingSnapshot | null } }).payload?.snapshot?.subscription;
          if (sub?.status === 'active' && sub?.paddleManaged) return;
          poll();
        }, 2000);
      };
      poll();
      startTransition(() => { void dispatch(fetchBillingPageData()); });
      return;
    }

    if (event.name === 'checkout.error' || event.name === 'checkout.failed') {
      setCheckoutPlan(null);
      setCheckoutError('Paddle could not complete the payment. Please try again.');
      return;
    }

    if (event.name === 'checkout.closed') {
      setCheckoutPlan(null);
    }
  }, [dispatch]);

  const currentTier = snapshot?.plan?.tier || 'starter';
  const autoPayEnabled = snapshot?.subscription?.status === 'active' && snapshot.subscription.paddleManaged;
  const isPaddleActive = snapshot?.subscription?.status === 'active' && snapshot?.subscription?.paddleManaged;
  const cancelEffectiveDate = snapshot?.subscription?.cancelDate
    ? new Date(snapshot.subscription.cancelDate)
    : null;
  const isCancelScheduled =
    snapshot?.subscription?.status === 'active' &&
    !!snapshot?.subscription?.paddleManaged &&
    !!cancelEffectiveDate &&
    !Number.isNaN(cancelEffectiveDate.getTime()) &&
    cancelEffectiveDate.getTime() > Date.now();
  const scheduledCancelDaysLeft = isCancelScheduled && cancelEffectiveDate
    ? Math.max(0, Math.ceil((cancelEffectiveDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : null;

  const tierOrder: PlanTier[] = ['starter', 'pro', 'premium'];
  const currentTierIndex = tierOrder.indexOf(currentTier);

  const getPlanCtaLabel = (planTier: PlanTier, isWorking: boolean) => {
    if (isWorking) return 'Processing...';
    const planIndex = tierOrder.indexOf(planTier);
    if (isPaddleActive) {
      if (planIndex > currentTierIndex) return `Upgrade to ${plans.find(p => p.tier === planTier)?.name || planTier}`;
      if (planIndex < currentTierIndex) return `Downgrade to ${plans.find(p => p.tier === planTier)?.name || planTier}`;
    }
    return `Subscribe to ${plans.find(p => p.tier === planTier)?.name || planTier}`;
  };

  const handlePlanAction = async (tier: PlanTier) => {
    if (isPaddleActive) {
      setCheckoutError(null);
      await dispatch(upgradeSubscription({ tier, billingCycle: cycle }));
    } else {
      await subscribe(tier);
    }
  };

  const usageLabel = useMemo(() => {
    if (!snapshot) return '';
    const used = snapshot.usage.imagesUsedThisMonth;
    const limit = snapshot.usage.imageUploadLimit;
    if (!limit) return `${used} uploads this month (unlimited plan)`;
    return `${used}/${limit} uploads used this month`;
  }, [snapshot]);

  const searchUsage = useMemo(() => {
    if (!snapshot) {
      return { used: 0, limit: 0, remaining: 0, unlimited: false };
    }

    const used = Number(snapshot.usage.imagesUsedThisMonth || 0);
    const limit = Number(snapshot.usage.imageUploadLimit || 0);
    if (limit <= 0) {
      return { used, limit, remaining: -1, unlimited: true };
    }

    const safeUsed = Math.max(0, used);
    const remaining = Math.max(0, limit - safeUsed);
    return { used: safeUsed, limit, remaining, unlimited: false };
  }, [snapshot]);

  const ensurePaddle = async () => {
    if (paddleRef.current) {
      return paddleRef.current;
    }

    if (!paddleClientToken) {
      throw new Error('Paddle checkout is not configured. Add NEXT_PUBLIC_PADDLE_CLIENT_TOKEN to enable paid subscriptions.');
    }

    if (!paddlePromiseRef.current) {
      paddlePromiseRef.current = (async () => {
        const { initializePaddle } = await import('@paddle/paddle-js');
        const instance = await initializePaddle({
          environment: paddleEnvironment,
          token: paddleClientToken,
          eventCallback: (event) => handlePaddleEvent(event),
        });

        if (!instance) {
          throw new Error('Paddle checkout could not be initialized.');
        }

        paddleRef.current = instance;
        return instance;
      })().catch((error) => {
        paddlePromiseRef.current = null;
        throw error;
      });
    }

    return paddlePromiseRef.current;
  };

  const subscribe = async (tier: PlanTier) => {
    setCheckoutError(null);
    setCheckoutPlan(tier);

    try {
      const paddle = await ensurePaddle();
      const response = await apiClient.post('/billing/paddle/checkout', {
        tier,
        billingCycle: cycle,
      });

      const transactionId: string | undefined = response.data?.transactionId;
      const checkoutUrl: string | undefined = response.data?.checkoutUrl;
      if (!transactionId && !checkoutUrl) {
        throw new Error('Billing API did not return a transaction ID.');
      }

      // Always prefer transactionId for overlay — using the URL causes "bad request"
      const openPayload = transactionId
        ? { transactionId }
        : { url: checkoutUrl! };

      paddle.Checkout.open({
        ...openPayload,
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          successUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        },
      } as unknown as CheckoutOpenOptions);
    } catch (paymentError) {
      setCheckoutPlan(null);
      setCheckoutError(getPaymentErrorMessage(paymentError, 'Unable to start Paddle checkout.'));
    }
  };

  const cancelSubscription = async () => {
    await dispatch(cancelPlanSubscription());
  };

  const handleResume = async () => {
    await dispatch(resumeSubscription());
  };

  const handleResumeAutoRenew = async () => {
    await dispatch(resumeAutoRenew());
  };

  const handleUpdatePayment = async () => {
    setUpdatePaymentLoading(true);
    try {
      const response = await apiClient.get('/billing/payment-method');
      const updateUrl: string | undefined = response.data?.updateUrl ?? response.data?.portalUrl;
      if (updateUrl) window.location.href = updateUrl;
    } catch {
      // ignore
    } finally {
      setUpdatePaymentLoading(false);
    }
  };

  const handleOpenInvoicePortal = async () => {
    setPortalLoading(true);
    try {
      const response = await apiClient.get('/billing/portal');
      const portalUrl: string | undefined = response.data?.portalUrl;
      if (portalUrl) {
        window.open(portalUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      // ignore
    } finally {
      setPortalLoading(false);
    }
  };

  const formatPaymentAmount = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
      }).format(amount);
    } catch {
      return `${currency || 'USD'} ${amount}`;
    }
  };

  // Cleanup polling on unmount
  useEffect(() => () => { if (pollTimerRef.current) clearTimeout(pollTimerRef.current); }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-100" />
        <div className="h-24 animate-pulse rounded-2xl border border-gray-100 bg-white" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-72 animate-pulse rounded-2xl border border-gray-100 bg-white" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Billing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your plan and check out securely with Paddle. Paid plans renew automatically until you cancel them here.
        </p>
      </div>

      {/* Trial / referral banner */}
      {snapshot?.subscription && (snapshot.subscription.isTrial || snapshot.subscription.status === 'trialing') && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <span className="font-semibold">
            {snapshot.subscription.trialDaysLeft != null
              ? `${snapshot.subscription.trialDaysLeft} day${snapshot.subscription.trialDaysLeft !== 1 ? 's' : ''} left on your free trial.`
              : 'Free trial active.'}
          </span>{' '}
          Subscribe below to keep access when it ends.
        </div>
      )}

      {/* Past-due warning */}
      {snapshot?.subscription?.status === 'past_due' && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span className="font-semibold">Payment failed — please update your payment method to avoid losing access.</span>
          {snapshot.subscription.paddleManaged && (
            <button
              type="button"
              disabled={updatePaymentLoading}
              onClick={handleUpdatePayment}
              className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {updatePaymentLoading ? 'Loading...' : 'Update Payment Method'}
            </button>
          )}
        </div>
      )}

      {/* Paused notice */}
      {snapshot?.subscription?.status === 'paused' && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          <span>
            <span className="mr-2 inline-block rounded-full bg-gray-300 px-2 py-0.5 text-xs font-semibold uppercase text-gray-700">Paused</span>
            Your subscription is paused.
            {snapshot.subscription.currentPeriodEnd && (
              <> Resumes or expires on {new Date(snapshot.subscription.currentPeriodEnd).toLocaleDateString()}.</>
            )}
          </span>
          {snapshot.subscription.paddleManaged && (
            <button
              type="button"
              disabled={resumeLoading}
              onClick={handleResume}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-60"
            >
              {resumeLoading ? 'Resuming...' : 'Resume'}
            </button>
          )}
        </div>
      )}

      {/* Scheduled cancellation notice */}
      {isCancelScheduled && cancelEffectiveDate && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>
            <span className="mr-2 inline-block rounded-full bg-amber-600 px-2 py-0.5 text-xs font-semibold uppercase text-white">Auto-renew off</span>
            Cancellation is scheduled for{' '}
            <span className="font-semibold">{cancelEffectiveDate.toLocaleDateString()}</span>.
            {scheduledCancelDaysLeft != null && (
              <> {scheduledCancelDaysLeft} day{scheduledCancelDaysLeft !== 1 ? 's' : ''} remaining in this billing period.</>
            )}
          </span>
          <button
            type="button"
            onClick={handleResumeAutoRenew}
            disabled={resumeAutoRenewLoading}
            className="rounded-md bg-amber-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-800 disabled:opacity-60"
          >
            {resumeAutoRenewLoading ? 'Resuming...' : 'Resume auto-renew'}
          </button>
        </div>
      )}

      {/* Cancelled notice */}
      {snapshot?.subscription?.status === 'cancelled' && snapshot.subscription.cancelDate && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>
            Your plan is cancelled. Access continues until{' '}
            <span className="font-semibold">{new Date(snapshot.subscription.cancelDate).toLocaleDateString()}</span>.
          </span>
          <button
            type="button"
            onClick={() => document.getElementById('plan-cards')?.scrollIntoView({ behavior: 'smooth' })}
            className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
          >
            Re-subscribe
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {checkoutError && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{checkoutError}</div>
      )}

      {!paddleClientToken && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Paid plans on this screen use Paddle checkout. Set NEXT_PUBLIC_PADDLE_CLIENT_TOKEN to enable paid subscriptions.
        </div>
      )}

      {/* Subscription status card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">Current Plan: {snapshot?.plan?.name || 'Starter'}</p>
            <p className="mt-1 text-xs text-gray-500">{usageLabel}</p>
            {snapshot && (
              <p className="mt-1 text-xs text-gray-500">
                {searchUsage.unlimited
                  ? 'Unlimited searches remaining'
                  : `${searchUsage.remaining} searches remaining`}
              </p>
            )}
            {snapshot?.alertsRemaining != null && (
              <p className="mt-1 text-xs text-gray-500">
                {snapshot.alertsRemaining === -1 ? 'Unlimited alerts' : `${snapshot.alertsRemaining} alerts remaining`}
              </p>
            )}

            {/* Upload quota progress bar */}
            {snapshot && snapshot.usage.imageUploadLimit > 0 && (() => {
              const used = searchUsage.used;
              const total = searchUsage.limit;
              const pct = Math.min(100, Math.max(0, Math.round((used / total) * 100)));
              return (
                <div className="mt-3 max-w-xs">
                  <div className="mb-1 flex justify-between text-[10px] text-gray-400">
                    <span>Uploads used</span>
                    <span>{used} / {total}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-gray-900 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })()}

            {/* Alerts quota — unlimited indicator */}
            {snapshot && snapshot.usage.alertLimit === 0 && (
              <div className="mt-3 max-w-xs">
                <div className="mb-1 flex justify-between text-[10px] text-gray-400">
                  <span>Alerts</span>
                  <span>Unlimited</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full w-full rounded-full bg-emerald-500" />
                </div>
              </div>
            )}
            {snapshot?.subscription?.nextBillingDate && (
              <p className="mt-1 text-xs text-gray-500">
                Next billing: {new Date(snapshot.subscription.nextBillingDate).toLocaleDateString()}
              </p>
            )}
            {autoPayEnabled && snapshot?.subscription?.billingCycle && !isCancelScheduled && (
              <p className="mt-1 text-xs text-gray-500">
                Auto-pay is active via Paddle and renews every{' '}
                {snapshot.subscription.billingCycle === 'annual' ? 'year' : 'month'} until cancelled.
              </p>
            )}
            {isCancelScheduled && cancelEffectiveDate && (
              <p className="mt-1 text-xs text-amber-700">
                Auto-renew is off. Access remains active until {cancelEffectiveDate.toLocaleDateString()}.
              </p>
            )}
            {!snapshot?.subscription?.paddleManaged && snapshot?.subscription && (
              <p className="mt-1 text-xs text-gray-400">
                Subscribe to a paid plan to manage billing options.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center rounded-lg border border-gray-300 bg-white p-1">
              <button
                type="button"
                onClick={() => setCycle('monthly')}
                className={[
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  cycle === 'monthly' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100',
                ].join(' ')}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setCycle('annual')}
                className={[
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  cycle === 'annual' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100',
                ].join(' ')}
              >
                Annual
              </button>
            </div>

            {/* Cancel — only for active + paddle-managed */}
            {snapshot?.subscription?.status === 'active' && snapshot.subscription.paddleManaged && (
              <button
                type="button"
                onClick={cancelSubscription}
                disabled={cancelLoading || isCancelScheduled}
                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                {cancelLoading ? 'Cancelling...' : isCancelScheduled ? 'Cancellation scheduled' : 'Cancel at period end'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Plan cards */}
      <div id="plan-cards" className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {plans.map((plan) => {
          const price = cycle === 'annual' ? plan.pricing.annual : plan.pricing.monthly;
          const isCurrent = plan.tier === currentTier;
          const isWorking = savingPlan === plan.tier || checkoutPlan === plan.tier || upgradeLoading === plan.tier;
          const isPaddleUnavailable = !paddleClientToken && !isPaddleActive;

          return (
            <div
              key={plan.tier}
              className={[
                'relative rounded-2xl border bg-white p-5 shadow-sm',
                isCurrent ? 'border-gray-900 ring-1 ring-gray-900/10' : 'border-gray-200',
              ].join(' ')}
            >
              {isCurrent && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                  <Crown className="h-3 w-3" />
                  Current
                </span>
              )}

              <h2 className="text-lg font-semibold text-gray-900">{plan.name}</h2>
              <p className="mt-2 text-2xl font-bold text-gray-900">{formatPrice(price)}</p>
              <p className="text-xs text-gray-500">per month ({cycle === 'annual' ? 'billed annually' : 'billed monthly'})</p>

              <p className="mt-2 text-xs text-gray-500">
                Auto-pay starts after checkout and renews {cycle === 'annual' ? 'yearly' : 'monthly'} until you cancel.
              </p>

              <div className="mt-4 space-y-2 text-sm text-gray-700">
                {plan.features.map((feature) => (
                  <p key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
                    <span>{feature}</span>
                  </p>
                ))}
              </div>

              <button
                type="button"
                disabled={isCurrent || isWorking || isPaddleUnavailable}
                onClick={() => handlePlanAction(plan.tier)}
                className="btn-primary w-full mt-5"
              >
                {isCurrent
                  ? 'Current plan'
                  : getPlanCtaLabel(plan.tier, isWorking)}
              </button>
            </div>
          );
        })}
      </div>

      {/* Billing history */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Billing history</h2>
            <p className="mt-1 text-xs text-gray-500">View your past charges and open the Paddle invoice portal to download receipts.</p>
          </div>
          <button
            type="button"
            onClick={handleOpenInvoicePortal}
            disabled={portalLoading}
            className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {portalLoading ? 'Opening...' : 'Open invoice portal'}
          </button>
        </div>

        {historyError && (
          <div className="mb-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">{historyError}</div>
        )}

        {historyLoading ? (
          <div className="text-sm text-gray-500">Loading billing history...</div>
        ) : historyItems.length === 0 ? (
          <div className="text-sm text-gray-500">No billing records yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-2 py-2">Date</th>
                  <th className="px-2 py-2">Amount</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {historyItems.map((item) => (
                  <tr key={item._id} className="border-b border-gray-100 text-gray-700">
                    <td className="px-2 py-2">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="px-2 py-2">{formatPaymentAmount(item.amount, item.currency)}</td>
                    <td className="px-2 py-2">
                      <span className={[
                        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                        item.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.status === 'refunded'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700',
                      ].join(' ')}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 font-mono text-xs text-gray-500">{item.paddleTransactionId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
