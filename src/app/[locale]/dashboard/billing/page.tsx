'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Check, Crown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { cancelPlanSubscription, fetchBillingPageData, subscribeToPlan } from '@/lib/store/slices/accountSlice';

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

export default function BillingPage() {
  const dispatch = useAppDispatch();
  const { plans, loading, error, savingPlan, cancelLoading, countryCode } = useAppSelector((state) => state.account.billing);
  const snapshot = useAppSelector((state) => state.account.subscription.data) as BillingSnapshot | null;
  const [cycle, setCycle] = useState<BillingCycle>('monthly');

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

  const currentTier = snapshot?.plan?.tier || 'starter';

  const usageLabel = useMemo(() => {
    if (!snapshot) return '';
    const used = snapshot.usage.imagesUsedThisMonth;
    const limit = snapshot.usage.imageUploadLimit;
    if (!limit) return `${used} uploads this month (unlimited plan)`;
    return `${used}/${limit} uploads used this month`;
  }, [snapshot]);

  const subscribe = async (tier: PlanTier) => {
    await dispatch(subscribeToPlan({ tier, billingCycle: cycle }));
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
          Choose a plan that fits your monitoring needs. Paddle integration can be added later without changing this screen.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
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

            {snapshot?.subscription?.status === 'active' && currentTier !== 'starter' && (
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
          const isWorking = savingPlan === plan.tier;

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
                disabled={isCurrent || isWorking}
                onClick={() => subscribe(plan.tier)}
                className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCurrent ? 'Current plan' : isWorking ? 'Updating...' : `Choose ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
