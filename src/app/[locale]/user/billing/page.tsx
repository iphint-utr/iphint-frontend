'use client';

import type { CheckoutOpenOptions, Paddle, PaddleEventData } from '@paddle/paddle-js';
import React, { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Crown } from 'lucide-react';
import { apiClient, getApiErrorMessage } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  cancelPlanSubscription,
  fetchBillingPageData,
  pauseSubscription,
  resumeSubscription,
} from '@/lib/store/slices/accountSlice';

const KRW_PER_USD = 1360;

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
  usage: {
    imagesUsedThisMonth: number;
    imageUploadLimit: number;
    alertLimit: number;
    pdfEnabled: boolean;
  };
}

const paddleEnvironment = process.env.NEXT_PUBLIC_PADDLE_ENV === 'sandbox' ? 'sandbox' : 'production';
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
  const { plans, loading, error, savingPlan, cancelLoading, pauseLoading, resumeLoading, countryCode } = useAppSelector((state) => state.account.billing);
  const snapshot = useAppSelector((state) => state.account.subscription.data) as BillingSnapshot | null;
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<PlanTier | null>(null);
  const [updatePaymentLoading, setUpdatePaymentLoading] = useState(false);
  const paddleRef = useRef<Paddle | null>(null);
  const paddlePromiseRef = useRef<Promise<Paddle> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isKorean = countryCode.toUpperCase() === 'KR';

  const formatPrice = (usd: number) => {
    if (isKorean) {
      const krw = Math.round(usd * KRW_PER_USD);
      return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW',
        maximumFractionDigits: 0,
      }).format(krw);
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(usd);
  };

  useEffect(() => {
    dispatch(fetchBillingPageData());
  }, [dispatch]);

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
  const autoPayEnabled = snapshot?.subscription?.status === 'active' && currentTier !== 'starter';

  const usageLabel = useMemo(() => {
    if (!snapshot) return '';
    const used = snapshot.usage.imagesUsedThisMonth;
    const limit = snapshot.usage.imageUploadLimit;
    if (!limit) return `${used} uploads this month (unlimited plan)`;
    return `${used}/${limit} uploads used this month`;
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

      const checkoutUrl: string | undefined = response.data?.checkoutUrl;
      if (!checkoutUrl) {
        throw new Error('Billing API did not return a checkout URL.');
      }

      const checkoutOptions: CheckoutOpenOptions = {
        url: checkoutUrl,
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          successUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        },
      };

      paddle.Checkout.open(checkoutOptions);
    } catch (paymentError) {
      setCheckoutPlan(null);
      setCheckoutError(getPaymentErrorMessage(paymentError, 'Unable to start Paddle checkout.'));
    }
  };

  const cancelSubscription = async () => {
    await dispatch(cancelPlanSubscription());
  };

  const handlePause = async () => {
    await dispatch(pauseSubscription());
  };

  const handleResume = async () => {
    await dispatch(resumeSubscription());
  };

  const handleUpdatePayment = async () => {
    setUpdatePaymentLoading(true);
    try {
      const response = await apiClient.get('/billing/payment-method');
      const updateUrl: string | undefined = response.data?.updateUrl;
      if (updateUrl) window.location.href = updateUrl;
    } catch {
      // ignore
    } finally {
      setUpdatePaymentLoading(false);
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

      {/* Cancelled notice */}
      {snapshot?.subscription?.status === 'cancelled' && snapshot.subscription.cancelDate && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your plan is cancelled. Access continues until{' '}
          <span className="font-semibold">{new Date(snapshot.subscription.cancelDate).toLocaleDateString()}</span>.
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
          <div>
            <p className="text-sm font-semibold text-gray-900">Current Plan: {snapshot?.plan?.name || 'Starter'}</p>
            <p className="mt-1 text-xs text-gray-500">{usageLabel}</p>
            {snapshot?.credits != null && (
              <p className="mt-1 text-xs text-gray-500">
                {snapshot.credits === -1 ? 'Unlimited searches remaining' : `${snapshot.credits} searches remaining`}
              </p>
            )}
            {snapshot?.subscription?.nextBillingDate && (
              <p className="mt-1 text-xs text-gray-500">
                Next billing: {new Date(snapshot.subscription.nextBillingDate).toLocaleDateString()}
              </p>
            )}
            {autoPayEnabled && snapshot?.subscription?.billingCycle && (
              <p className="mt-1 text-xs text-gray-500">
                Auto-pay is active via Paddle and renews every{' '}
                {snapshot.subscription.billingCycle === 'annual' ? 'year' : 'month'} until cancelled.
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

            {/* Pause — only for active + paddle-managed */}
            {snapshot?.subscription?.status === 'active' && snapshot.subscription.paddleManaged && !snapshot.subscription.isTrial && (
              <button
                type="button"
                onClick={handlePause}
                disabled={pauseLoading}
                className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60"
              >
                {pauseLoading ? 'Pausing...' : 'Pause'}
              </button>
            )}

            {/* Cancel — only for active + paddle-managed */}
            {snapshot?.subscription?.status === 'active' && snapshot.subscription.paddleManaged && (
              <button
                type="button"
                onClick={cancelSubscription}
                disabled={cancelLoading}
                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                {cancelLoading ? 'Cancelling...' : 'Cancel plan'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {plans.map((plan) => {
          const price = cycle === 'annual' ? plan.pricing.annual : plan.pricing.monthly;
          const isCurrent = plan.tier === currentTier;
          const isWorking = savingPlan === plan.tier || checkoutPlan === plan.tier;
          const isPaddleUnavailable = !paddleClientToken;

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
                onClick={() => subscribe(plan.tier)}
                className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCurrent
                  ? 'Current plan'
                  : isWorking
                    ? 'Opening Paddle...'
                    : `Subscribe to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
