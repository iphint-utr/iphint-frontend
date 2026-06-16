'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { apiClient } from '@/lib/api';
import { Zap, X } from 'lucide-react';

export default function TrialModal() {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Get subscription state from Redux
  const snapshot = useAppSelector((state) => state.account.subscription.data);
  const user = useAppSelector((state) => state.user);
  const isReferred = user?.isReferred;

  // Check if user is eligible for trial (no active subscription, trial not started)
  useEffect(() => {
    if (!snapshot?.subscription || !user) {
      setIsOpen(false);
      return;
    }

    const hasActiveSubscription = snapshot.subscription.status === 'active';
    const isOnTrial = snapshot.subscription.status === 'trialing' || snapshot.subscription.isTrial;
    const hasDismissedModal = localStorage.getItem('trial-modal-dismissed');

    // Show modal if no active subscription, no trial active, and not dismissed
    if (!hasActiveSubscription && !isOnTrial && !dismissed && !hasDismissedModal) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [snapshot, user, dismissed]);

  const handleStartTrial = async () => {
    try {
      setIsLoading(true);
      // Call endpoint to start the trial for Pro plan
      await apiClient.post('/billing/start-trial', {
        tier: 'pro',
      });
      
      setIsOpen(false);
      // Optionally refresh billing data
      // dispatch(fetchBillingPageData());
    } catch (error) {
      console.error('Failed to start trial:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('trial-modal-dismissed', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Icon */}
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-yellow-100 p-4">
              <Zap className="text-yellow-600" size={32} />
            </div>
          </div>

          {/* Heading */}
          <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">
            {t('startProTrial') || (isReferred ? 'Start Your 1-Month Pro Trial' : 'Start Your 7-Day Pro Trial')}
          </h2>

          {/* Description */}
          <p className="mb-6 text-center text-gray-600">
            {t('trialModalDescription') ||
              (isReferred ? 'Unlock Pro features for 1 month free. No credit card required. Upgrade anytime.' : 'Unlock Pro features for 7 days free. No credit card required. Upgrade anytime.')}
          </p>

          {/* Features */}
          <div className="mb-8 space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0 rounded-full bg-emerald-100 p-1">
                <svg
                  className="h-4 w-4 text-emerald-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-sm text-gray-700">
                {t('trialFeature1') || '5,000 monthly searches'}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0 rounded-full bg-emerald-100 p-1">
                <svg
                  className="h-4 w-4 text-emerald-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-sm text-gray-700">
                {t('trialFeature2') || 'Unlimited monitoring alerts'}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0 rounded-full bg-emerald-100 p-1">
                <svg
                  className="h-4 w-4 text-emerald-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-sm text-gray-700">
                {t('trialFeature3') || 'Advanced search capabilities'}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleStartTrial}
              disabled={isLoading}
              className="w-full rounded-lg bg-gray-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60 transition-colors"
            >
              {isLoading
                ? (t('loading') || 'Starting...')
                : (t('startTrialButton') || (isReferred ? 'Start 1-Month Trial' : 'Start 7-Day Trial'))}
            </button>
            <button
              onClick={handleDismiss}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('maybeLater') || 'Maybe Later'}
            </button>
          </div>

          {/* Footer note */}
          <p className="mt-4 text-center text-xs text-gray-500">
            {t('trialFooter') ||
              (isReferred ? 'Your trial will expire after 1 month. You can upgrade anytime.' : 'Your trial will expire after 7 days. You can upgrade anytime.')}
          </p>
        </div>
      </div>
    </div>
  );
}
