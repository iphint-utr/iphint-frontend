'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock3, Search, ShieldCheck } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import AdminMetricCard from '@/components/admin/AdminMetricCard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminPanel from '@/components/admin/AdminPanel';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminStatusBadge from '@/components/admin/AdminStatusBadge';
import { formatAdminDate, formatAdminNumber } from '@/lib/adminFormat';
import { getAdminStatusToken, humanizeAdminValue } from '@/lib/adminLabels';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { truncateText } from '@/lib/utils';
import { clearAdminSearchDetailsState, fetchAdminSearchDetails } from '@/lib/store/slices/adminSlice';

const resultPageSizeOptions = [10, 20, 50, 100];

const serializeDetailValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export default function AdminSearchDetailsPage() {
  const params = useParams<{ searchId: string }>();
  const searchId = Array.isArray(params.searchId) ? params.searchId[0] : params.searchId;
  const t = useTranslations('Admin');
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.admin.searchDetails);
  const [resultControls, setResultControls] = useState({
    searchId: searchId ?? '',
    page: 1,
    limit: 10,
  });

  const activePage = resultControls.searchId === (searchId ?? '') ? resultControls.page : 1;
  const activeLimit = resultControls.searchId === (searchId ?? '') ? resultControls.limit : 10;

  useEffect(() => {
    return () => {
      dispatch(clearAdminSearchDetailsState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!searchId) {
      return;
    }

    dispatch(fetchAdminSearchDetails({ searchId, page: activePage, limit: activeLimit }));
  }, [activeLimit, activePage, dispatch, searchId]);

  const getStatusLabel = (status: string) => {
    const statusToken = getAdminStatusToken(status);
    return statusToken ? t(`common.statusLabels.${statusToken}`) : humanizeAdminValue(status);
  };

  if (!searchId) {
    return null;
  }

  if (loading && !data) {
    return (
      <AdminPanel title={t('searchDetails.loadingTitle')} description={t('searchDetails.loadingDescription')}>
        <p className="py-10 text-center text-sm text-slate-500">{t('searchDetails.loading')}</p>
      </AdminPanel>
    );
  }

  if (error && !data) {
    return (
      <AdminPanel title={t('searchDetails.errorTitle')} description={t('searchDetails.errorDescription')}>
        <div className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800">{error}</div>
      </AdminPanel>
    );
  }

  if (!data) {
    return null;
  }

  const resultItems = data.results.data;
  const resultPagination = data.results.pagination;
  const reviewedCount = resultItems.filter((result) => result.reviewStatus === 'reviewed' || Boolean(result.reviewedAt)).length;
  const pendingReviewCount = Math.max(resultItems.length - reviewedCount, 0);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow={t('searchDetails.eyebrow')}
        title={t('searchDetails.title')}
        description={t('searchDetails.description')}
        actions={
          <Link
            href="/admin/searches"
            className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('searchDetails.backToSearches')}
          </Link>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          title={t('searchDetails.metrics.results')}
          value={formatAdminNumber(resultPagination.total, locale)}
          hint={t('searchDetails.metricHints.results')}
          icon={<Search className="h-5 w-5" />}
          accent="teal"
        />
        <AdminMetricCard
          title={t('searchDetails.metrics.reviewed')}
          value={formatAdminNumber(reviewedCount, locale)}
          hint={t('searchDetails.metricHints.reviewed')}
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="emerald"
        />
        <AdminMetricCard
          title={t('searchDetails.metrics.pendingReview')}
          value={formatAdminNumber(pendingReviewCount, locale)}
          hint={t('searchDetails.metricHints.pendingReview')}
          icon={<Clock3 className="h-5 w-5" />}
          accent="amber"
        />
        <AdminMetricCard
          title={t('searchDetails.metrics.status')}
          value={getStatusLabel(data.status)}
          hint={t('searchDetails.metricHints.status')}
          icon={<ShieldCheck className="h-5 w-5" />}
          accent="slate"
        />
      </div>

      <div className="space-y-6">
        <AdminPanel title={t('searchDetails.overviewTitle')} description={t('searchDetails.overviewDescription')}>
          <div className="grid gap-6 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
              <div className="relative aspect-square w-full">
                <Image
                  src={data.image || '/logo.svg'}
                  alt={t('searchDetails.searchImageAlt')}
                  fill
                  sizes="(max-width: 1024px) 100vw, 280px"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-600">
              <div className="flex flex-wrap items-center gap-2">
                <AdminStatusBadge value={data.status} label={getStatusLabel(data.status)} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t('searchDetails.fields.uploader')}</p>
                  <Link href={`/admin/members/${data.uploader._id}`} className="mt-2 block text-sm font-semibold text-slate-950 hover:underline" title={data.uploader.name}>
                    {truncateText(data.uploader.name, 34)}
                  </Link>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t('searchDetails.fields.uploaderEmail')}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900" title={data.uploader.email}>
                    {truncateText(data.uploader.email, 38)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t('searchDetails.fields.uploadedAt')}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{formatAdminDate(data.date, locale)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t('searchDetails.fields.nextRescan')}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{data.nextRescanAt ? formatAdminDate(data.nextRescanAt, locale) : t('memberDetails.unavailable')}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t('searchDetails.fields.lastRescan')}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{data.lastRescanAt ? formatAdminDate(data.lastRescanAt, locale) : t('memberDetails.unavailable')}</p>
                </div>
              </div>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel
          title={t('searchDetails.resultsTitle')}
          description={t('searchDetails.resultsDescription', { total: formatAdminNumber(resultPagination.total, locale) })}
          actions={
            <select
              value={activeLimit}
              onChange={(event) => {
                setResultControls({
                  searchId: searchId ?? '',
                  page: 1,
                  limit: Number(event.target.value),
                });
              }}
              aria-label={t('searchDetails.resultsPerPageLabel')}
              className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none sm:w-auto"
            >
              {resultPageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {t('users.filters.perPage', { count: option })}
                </option>
              ))}
            </select>
          }
        >
          {loading && !resultItems.length ? (
            <p className="py-12 text-center text-sm text-slate-500">{t('searchDetails.resultsLoading')}</p>
          ) : resultItems.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">{t('searchDetails.resultsEmpty')}</p>
          ) : (
            <div className="space-y-4">
              {resultItems.map((result, index) => {
                const detailEntries = Object.entries(result.details ?? {});
                const cardIndex = (resultPagination.page - 1) * resultPagination.limit + index + 1;

                return (
                  <article key={result._id || `${index}`} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                    <div className="grid gap-5 lg:grid-cols-[128px_minmax(0,1fr)]">
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <div className="relative aspect-square w-full">
                          <Image
                            src={result.image || data.image || '/logo.svg'}
                            alt={t('searchDetails.resultImageAlt')}
                            fill
                            sizes="128px"
                            className="object-cover"
                          />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold text-slate-950">{t('searchDetails.resultTitle', { index: cardIndex })}</h3>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <AdminStatusBadge value={result.reviewStatus} label={getStatusLabel(result.reviewStatus)} />
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t('searchDetails.resultFields.reviewedAt')}</p>
                            <p className="mt-2 font-medium text-slate-900">{result.reviewedAt ? formatAdminDate(result.reviewedAt, locale) : t('memberDetails.unavailable')}</p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t('searchDetails.resultFields.details')}</p>
                          {detailEntries.length === 0 ? (
                            <p className="mt-3 text-sm text-slate-500">{t('searchDetails.resultDetailsEmpty')}</p>
                          ) : (
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              {detailEntries.map(([key, value]) => {
                                const normalizedValue = serializeDetailValue(value) || t('memberDetails.unavailable');

                                return (
                                  <div key={key} className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{humanizeAdminValue(key)}</p>
                                    <p className="mt-2 text-sm font-medium text-slate-900" title={normalizedValue}>
                                      {truncateText(normalizedValue, 80)}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <AdminPagination
            page={resultPagination.page}
            pages={resultPagination.pages}
            total={resultPagination.total}
            visibleCount={resultItems.length}
            onPageChange={(nextPage) =>
              setResultControls({
                searchId: searchId ?? '',
                page: nextPage,
                limit: activeLimit,
              })
            }
            previousLabel={t('common.previous')}
            nextLabel={t('common.next')}
            summaryLabel={t('common.paginationSummary', { count: '{count}', total: '{total}' })}
          />
        </AdminPanel>
      </div>
    </div>
  );
}