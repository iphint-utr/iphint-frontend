'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Ban, CreditCard, Search, ShieldCheck, UserRound } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import AdminMetricCard from '@/components/admin/AdminMetricCard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminPanel from '@/components/admin/AdminPanel';
import AdminStatusBadge from '@/components/admin/AdminStatusBadge';
import { formatAdminDate, formatAdminNumber } from '@/lib/adminFormat';
import { getAdminStatusToken, humanizeAdminValue } from '@/lib/adminLabels';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  clearAdminDeactivationFeedback,
  clearAdminMemberState,
  deactivateAdminUser,
  fetchAdminUserDetails,
  fetchAdminUserSearches,
} from '@/lib/store/slices/adminSlice';

export default function AdminMemberDetailsPage() {
  const params = useParams<{ userId: string }>();
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;
  const t = useTranslations('Admin');
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.admin.memberDetails);
  const searchesState = useAppSelector((state) => state.admin.memberSearches);
  const deactivation = useAppSelector((state) => state.admin.deactivation);
  const [searchPage, setSearchPage] = useState(1);
  const [searchLimit, setSearchLimit] = useState(10);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!userId) {
      return;
    }

    dispatch(fetchAdminUserDetails(userId));

    return () => {
      dispatch(clearAdminMemberState());
      dispatch(clearAdminDeactivationFeedback());
    };
  }, [dispatch, userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    dispatch(fetchAdminUserSearches({ userId, page: searchPage, limit: searchLimit }));
  }, [dispatch, searchLimit, searchPage, userId]);

  const getStatusLabel = (status: string) => {
    const statusToken = getAdminStatusToken(status);
    return statusToken ? t(`common.statusLabels.${statusToken}`) : humanizeAdminValue(status);
  };

  const isDeactivating = userId ? Boolean(deactivation.loadingByUserId[userId]) : false;

  if (!userId) {
    return null;
  }

  if (loading && !data) {
    return (
      <AdminPanel title={t('memberDetails.loadingTitle')} description={t('memberDetails.loadingDescription')}>
        <p className="py-10 text-center text-sm text-slate-500">{t('memberDetails.loading')}</p>
      </AdminPanel>
    );
  }

  if (error && !data) {
    return (
      <AdminPanel title={t('memberDetails.errorTitle')} description={t('memberDetails.errorDescription')}>
        <div className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800">{error}</div>
      </AdminPanel>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow={t('memberDetails.eyebrow')}
        title={t('memberDetails.title', { name: data.name })}
        description={t('memberDetails.description')}
        actions={
          <Link
            href="/admin/users"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('memberDetails.backToUsers')}
          </Link>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          title={t('memberDetails.metrics.credits')}
          value={formatAdminNumber(data.credits, locale)}
          hint={t('memberDetails.metricHints.credits')}
          icon={<CreditCard className="h-5 w-5" />}
          accent="teal"
        />
        <AdminMetricCard
          title={t('memberDetails.metrics.monitors')}
          value={formatAdminNumber(data.monitors, locale)}
          hint={t('memberDetails.metricHints.monitors')}
          icon={<ShieldCheck className="h-5 w-5" />}
          accent="slate"
        />
        <AdminMetricCard
          title={t('memberDetails.metrics.searches')}
          value={formatAdminNumber(data.searchCount, locale)}
          hint={t('memberDetails.metricHints.searches')}
          icon={<Search className="h-5 w-5" />}
          accent="emerald"
        />
        <AdminMetricCard
          title={t('memberDetails.metrics.referrals')}
          value={formatAdminNumber(data.referralCount, locale)}
          hint={t('memberDetails.metricHints.referrals')}
          icon={<UserRound className="h-5 w-5" />}
          accent="amber"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <AdminPanel title={t('memberDetails.profileTitle')} description={t('memberDetails.profileDescription')}>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-4 rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t('memberDetails.fields.contact')}</p>
                  <p className="mt-2 text-base font-semibold text-slate-950">{data.email}</p>
                  <p className="mt-1 text-sm text-slate-500">{data.phoneNumber || t('memberDetails.unavailable')}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <AdminStatusBadge value={data.isActive ? 'active' : 'inactive'} label={getStatusLabel(data.isActive ? 'active' : 'inactive')} />
                  <AdminStatusBadge value={data.isApproved ? 'approved' : 'inactive'} label={data.isApproved ? t('common.statusLabels.approved') : getStatusLabel('inactive')} />
                  <AdminStatusBadge value={data.role} label={humanizeAdminValue(data.role)} />
                </div>
              </div>

              <div className="space-y-3 rounded-3xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-4">
                  <span>{t('memberDetails.fields.joined')}</span>
                  <span className="font-medium text-slate-900">{formatAdminDate(data.joiningDate, locale)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>{t('memberDetails.fields.referralCode')}</span>
                  <span className="font-medium text-slate-900">{data.referralCode || t('memberDetails.unavailable')}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>{t('memberDetails.fields.subscriptionId')}</span>
                  <span className="font-medium text-slate-900">{data.subscriptionId || t('memberDetails.unavailable')}</span>
                </div>
              </div>
            </div>
          </AdminPanel>

          <AdminPanel title={t('memberDetails.searchesTitle')} description={t('memberDetails.searchesDescription')}>
            <div className="mb-4 flex justify-end">
              <select
                value={searchLimit}
                onChange={(event) => {
                  setSearchLimit(Number(event.target.value));
                  setSearchPage(1);
                }}
                className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
              >
                {[10, 20, 50].map((option) => (
                  <option key={option} value={option}>
                    {t('users.filters.perPage', { count: option })}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('memberDetails.searchColumns.image')}</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('memberDetails.searchColumns.status')}</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('memberDetails.searchColumns.date')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {searchesState.loading ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-12 text-center text-sm text-slate-500">
                        {t('memberDetails.searchesLoading')}
                      </td>
                    </tr>
                  ) : searchesState.error ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-12 text-center text-sm text-slate-800">
                        {searchesState.error}
                      </td>
                    </tr>
                  ) : searchesState.data.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-12 text-center text-sm text-slate-500">
                        {t('memberDetails.searchesEmpty')}
                      </td>
                    </tr>
                  ) : (
                    searchesState.data.map((searchItem) => (
                      <tr key={searchItem._id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <img src={searchItem.image} alt="search" className="h-14 w-14 rounded-2xl border border-slate-200 object-cover" />
                            <p className="text-sm font-medium text-slate-800">{searchItem._id}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <AdminStatusBadge value={searchItem.status} label={getStatusLabel(searchItem.status)} />
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">{formatAdminDate(searchItem.date, locale)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <AdminPagination
              page={searchesState.pagination.page}
              pages={searchesState.pagination.pages}
              total={searchesState.pagination.total}
              visibleCount={searchesState.data.length}
              onPageChange={setSearchPage}
              previousLabel={t('common.previous')}
              nextLabel={t('common.next')}
              summaryLabel={t('common.paginationSummary', { count: '{count}', total: '{total}' })}
            />
          </AdminPanel>
        </div>

        <div className="space-y-6">
          <AdminPanel title={t('memberDetails.subscriptionTitle')} description={t('memberDetails.subscriptionDescription')}>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-4">
                <span>{t('memberDetails.subscriptionFields.plan')}</span>
                <span className="font-medium text-slate-900">{data.subscription?.planId || t('memberDetails.unavailable')}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>{t('memberDetails.subscriptionFields.status')}</span>
                <AdminStatusBadge
                  value={data.subscription?.status || 'inactive'}
                  label={data.subscription?.status ? getStatusLabel(data.subscription.status) : t('memberDetails.unavailable')}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>{t('memberDetails.subscriptionFields.billingCycle')}</span>
                <span className="font-medium text-slate-900">{data.subscription?.billingCycle || t('memberDetails.unavailable')}</span>
              </div>
            </div>
          </AdminPanel>

          <AdminPanel title={t('memberDetails.adminActionsTitle')} description={t('memberDetails.adminActionsDescription')}>
            <div className="space-y-4">
              {deactivation.successMessage ? (
                <div className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800">
                  {deactivation.successMessage}
                </div>
              ) : null}
              {deactivation.error ? (
                <div className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800">
                  {deactivation.error}
                </div>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">{t('memberDetails.deactivateReasonLabel')}</span>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder={t('memberDetails.deactivateReasonPlaceholder')}
                  rows={4}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>

              <button
                type="button"
                disabled={!data.isActive || isDeactivating}
                onClick={() => dispatch(deactivateAdminUser({ userId, reason: reason.trim() || undefined }))}
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Ban className="mr-2 h-4 w-4" />
                {data.isActive ? t('memberDetails.deactivateButton') : t('memberDetails.alreadyInactive')}
              </button>
            </div>
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}