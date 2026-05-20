'use client';

import type { CheckoutCustomer, CheckoutOpenLineItem, CheckoutOpenOptions, Paddle, PaddleEventData } from '@paddle/paddle-js';
import React, { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Crown } from 'lucide-react';
import { apiClient, getApiErrorMessage } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { cancelPlanSubscription, fetchBillingPageData } from '@/lib/store/slices/accountSlice';

const KRW_PER_USD = 1360;

type PlanTier = 'starter' | 'pro' | 'premium';
type BillingCycle = 'monthly' | 'annual';

interface Plan {
  tier: PlanTier;
  name: string;
  imageUploadLimit: number;
  maxResults: number;
  pdfEnabled: boolean;
  weeklyEmailAlerts: boolean;
  features: string[];
  pricing: { monthly: number; annual: number };
}

interface BillingSnapshot {
  subscription: {
    id: string;
    status: 'active' | 'cancelled' | 'expired' | 'pending';
    billingCycle: BillingCycle;
    activationDate?: string;
    currentPeriodEnd?: string;
    nextBillingDate?: string;
    cancelDate?: string;
  } | null;
  plan: Plan;
  usage: {
    imagesUsedThisMonth: number;
    imageUploadLimit: number;
    maxResults: number;
    pdfEnabled: boolean;
  };
}

interface PaddleCheckoutPayload {
  transactionId?: string;
  items?: CheckoutOpenLineItem[];
  customer?: CheckoutCustomer;
  customerAuthToken?: string;
  customData?: Record<string, unknown>;
  settings?: CheckoutOpenOptions['settings'];
  discountCode?: string | null;
}

interface PaddleCheckoutResponse extends PaddleCheckoutPayload {
  checkout?: PaddleCheckoutPayload;
}

const paddleEnvironment = process.env.NEXT_PUBLIC_PADDLE_ENV === 'sandbox' ? 'sandbox' : 'production';
const paddleClientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN?.trim().replace(/^['"]|['"]$/g, '') || undefined;

const normalizePaddleCheckoutPayload = (payload: PaddleCheckoutResponse) => payload.checkout ?? payload;

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
  const { plans, loading, error, savingPlan, cancelLoading, countryCode } = useAppSelector((state) => state.account.billing);
  const snapshot = useAppSelector((state) => state.account.subscription.data) as BillingSnapshot | null;
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<PlanTier | null>(null);
  const paddleRef = useRef<Paddle | null>(null);
  const paddlePromiseRef = useRef<Promise<Paddle> | null>(null);

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
      startTransition(() => {
        void dispatch(fetchBillingPageData());
      });
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
      const checkoutPayload = normalizePaddleCheckoutPayload((response.data ?? {}) as PaddleCheckoutResponse);

      if (!checkoutPayload.transactionId && !checkoutPayload.items?.length) {
        throw new Error('Billing API did not return Paddle checkout data.');
      }

      const checkoutOptions: CheckoutOpenOptions = {
        ...(checkoutPayload.transactionId
          ? { transactionId: checkoutPayload.transactionId }
          : {
              items: checkoutPayload.items!.map((item) => ({
                priceId: item.priceId,
                quantity: item.quantity ?? 1,
              })),
            }),
        ...(checkoutPayload.customerAuthToken
          ? { customerAuthToken: checkoutPayload.customerAuthToken }
          : checkoutPayload.customer
            ? { customer: checkoutPayload.customer }
            : {}),
        ...(checkoutPayload.customData ? { customData: checkoutPayload.customData } : {}),
        ...(checkoutPayload.discountCode ? { discountCode: checkoutPayload.discountCode } : {}),
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          successUrl: typeof window !== 'undefined' ? window.location.href : undefined,
          ...(checkoutPayload.settings ?? {}),
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

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Current Plan: {snapshot?.plan?.name || 'Starter'}</p>
            <p className="mt-1 text-xs text-gray-500">{usageLabel}</p>
            {snapshot?.subscription?.nextBillingDate && (
              <p className="mt-1 text-xs text-gray-500">
                Next billing: {new Date(snapshot.subscription.nextBillingDate).toLocaleDateString()}
              </p>
            )}
            {autoPayEnabled && snapshot?.subscription?.billingCycle && (
              <p className="mt-1 text-xs text-gray-500">
                Auto-pay is active via Paddle and renews every {snapshot.subscription.billingCycle === 'annual' ? 'year' : 'month'} until cancelled.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
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

            {snapshot?.subscription?.status === 'active' && (
              <button
                type="button"
                onClick={cancelSubscription}
                disabled={cancelLoading}
                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                {cancelLoading ? 'Cancelling...' : 'Cancel plan'}
              </button>
            )}
          </div>
        </div>
      </div>

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
