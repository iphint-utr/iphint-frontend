'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Filter, RotateCcw, Search, ShieldCheck, Users } from 'lucide-react';
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
import { fetchAdminUsers } from '@/lib/store/slices/adminSlice';

const pageSizeOptions = [10, 20, 50];

export default function AdminUsersPage() {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const { data, pagination, loading, error } = useAppSelector((state) => state.admin.users);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    dispatch(
      fetchAdminUsers({
        page,
        limit,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: appliedSearch || undefined,
      }),
    );
  }, [appliedSearch, dispatch, limit, page, statusFilter]);

  const activeCount = data.filter((member) => member.status === 'active').length;
  const proCount = data.filter((member) => member.subscription?.tier === 'pro').length;

  const getStatusLabel = (status: string) => {
    const statusToken = getAdminStatusToken(status);
    return statusToken ? t(`common.statusLabels.${statusToken}`) : humanizeAdminValue(status);
  };

  const applyFilters = () => {
    startTransition(() => {
      setPage(1);
      setAppliedSearch(searchInput.trim());
    });
  };

  const resetFilters = () => {
    startTransition(() => {
      setSearchInput('');
      setAppliedSearch('');
      setStatusFilter('all');
      setLimit(10);
      setPage(1);
    });
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow={t('users.eyebrow')}
        title={t('users.title')}
        description={t('users.description')}
        actions={
          <button
            type="button"
            onClick={() => dispatch(fetchAdminUsers({ page, limit, status: statusFilter === 'all' ? undefined : statusFilter, search: appliedSearch || undefined }))}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {t('common.refresh')}
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          title={t('users.summary.totalMembers')}
          value={formatAdminNumber(pagination.total, locale)}
          hint={t('users.summary.totalMembersHint')}
          icon={<Users className="h-5 w-5" />}
          accent="teal"
        />
        <AdminMetricCard
          title={t('users.summary.visibleMembers')}
          value={formatAdminNumber(data.length, locale)}
          hint={t('users.summary.visibleMembersHint')}
          icon={<Search className="h-5 w-5" />}
          accent="slate"
        />
        <AdminMetricCard
          title={t('users.summary.activeAccounts')}
          value={formatAdminNumber(activeCount, locale)}
          hint={t('users.summary.activeAccountsHint')}
          icon={<ShieldCheck className="h-5 w-5" />}
          accent="emerald"
        />
        <AdminMetricCard
          title={t('users.summary.proPlans')}
          value={formatAdminNumber(proCount, locale)}
          hint={t('users.summary.proPlansHint')}
          icon={<Filter className="h-5 w-5" />}
          accent="amber"
        />
      </div>

      <AdminPanel title={t('users.tableTitle')} description={t('users.tableDescription')}>
        <div className="mb-6 grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_220px_140px_auto]">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  applyFilters();
                }
              }}
              placeholder={t('users.filters.searchPlaceholder')}
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
          >
            <option value="all">{t('users.filters.allStatuses')}</option>
            <option value="active">{t('common.statusLabels.active')}</option>
            <option value="inactive">{t('common.statusLabels.inactive')}</option>
          </select>

          <select
            value={limit}
            onChange={(event) => {
              setLimit(Number(event.target.value));
              setPage(1);
            }}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {t('users.filters.perPage', { count: option })}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={applyFilters}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {t('common.apply')}
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {t('common.reset')}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('users.columns.member')}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('users.columns.status')}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('users.columns.plan')}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('users.columns.searches')}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('users.columns.joined')}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('users.columns.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                    {t('users.loading')}
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-800">
                    {error}
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                    {t('users.empty')}
                  </td>
                </tr>
              ) : (
                data.map((member) => (
                  <tr key={member._id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{member.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{member.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <AdminStatusBadge value={member.status} label={getStatusLabel(member.status)} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-slate-700">
                        <p className="font-medium text-slate-900">{member.subscription?.tier ?? t('users.planFallback')}</p>
                        <p className="mt-1 text-xs text-slate-500">{member.subscription?.status ?? t('users.subscriptionUnavailable')}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-700">{formatAdminNumber(member.searchCount, locale)}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{formatAdminDate(member.joiningDate, locale)}</td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/members/${member._id}`}
                        className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        {t('common.viewDetails')}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <AdminPagination
          page={pagination.page}
          pages={pagination.pages}
          total={pagination.total}
          visibleCount={data.length}
          onPageChange={setPage}
          previousLabel={t('common.previous')}
          nextLabel={t('common.next')}
          summaryLabel={t('common.paginationSummary', { count: '{count}', total: '{total}' })}
        />
      </AdminPanel>
    </div>
  );
}