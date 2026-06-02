'use client';

import React, { useEffect, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, Clock3, Eye, MousePointerClick, Users } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import AdminMetricCard from '@/components/admin/AdminMetricCard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminPanel from '@/components/admin/AdminPanel';
import { formatAdminNumber } from '@/lib/adminFormat';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchAdminWebsiteAnalytics } from '@/lib/store/slices/adminSlice';
import type { AdminAnalyticsDateRange } from '@/types/admin';

const SOURCE_COLORS = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];

const toReadableDuration = (seconds: number): string => {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const remainingSeconds = total % 60;
  if (!minutes) {
    return `${remainingSeconds}s`;
  }
  return `${minutes}m ${remainingSeconds}s`;
};

const formatPercent = (value: number): string => `${Number(value || 0).toFixed(1)}%`;

export default function AdminAnalyticsPage() {
  const t = useTranslations('Admin.analytics');
  const common = useTranslations('Admin.common');
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const analyticsState = useAppSelector((state) => state.admin.analytics);

  useEffect(() => {
    if (!analyticsState.data) {
      dispatch(fetchAdminWebsiteAnalytics({ range: analyticsState.range }));
    }
  }, [analyticsState.data, analyticsState.range, dispatch]);

  const analytics = analyticsState.data;

  const growthSeries = useMemo(() => {
    if (!analytics?.trafficGrowth?.length) {
      return [];
    }

    return analytics.trafficGrowth.map((point, index, list) => {
      const previous = index > 0 ? list[index - 1].visitors : point.visitors;
      const growthRate = previous > 0 ? ((point.visitors - previous) / previous) * 100 : 0;

      return {
        date: point.date,
        growthRate: Number(growthRate.toFixed(2)),
      };
    });
  }, [analytics?.trafficGrowth]);

  const deviceChartData = analytics?.deviceUsage?.map((item) => ({
    name: item.label,
    value: item.sessions,
  })) || [];

  const sourceChartData = analytics?.trafficSources?.map((item) => ({
    name: item.label,
    value: item.sessions,
  })) || [];

  const handleRangeChange = (range: AdminAnalyticsDateRange) => {
    dispatch(fetchAdminWebsiteAnalytics({ range }));
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1">
            {(['7d', '30d', '90d'] as AdminAnalyticsDateRange[]).map((range) => {
              const active = analyticsState.range === range;
              return (
                <button
                  key={range}
                  type="button"
                  onClick={() => handleRangeChange(range)}
                  className={[
                    'rounded-xl px-3 py-1.5 text-sm font-medium transition-colors',
                    active ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {range === '7d' ? t('filters.last7Days') : range === '30d' ? t('filters.last30Days') : t('filters.last90Days')}
                </button>
              );
            })}
          </div>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
        <AdminMetricCard
          title={t('metrics.totalVisitors')}
          value={formatAdminNumber(analytics?.summary.totalVisitors ?? 0, locale)}
          hint={t('hints.totalVisitors')}
          icon={<Users className="h-5 w-5" />}
          accent="teal"
        />
        <AdminMetricCard
          title={t('metrics.activeVisitors')}
          value={formatAdminNumber(analytics?.summary.activeVisitors ?? 0, locale)}
          hint={t('hints.activeVisitors')}
          icon={<Activity className="h-5 w-5" />}
          accent="emerald"
        />
        <AdminMetricCard
          title={t('metrics.pageViews')}
          value={formatAdminNumber(analytics?.summary.pageViews ?? 0, locale)}
          hint={t('hints.pageViews')}
          icon={<Eye className="h-5 w-5" />}
          accent="slate"
        />
        <AdminMetricCard
          title={t('metrics.engagementRate')}
          value={formatPercent(analytics?.summary.engagementRate ?? 0)}
          hint={t('hints.engagementRate')}
          icon={<MousePointerClick className="h-5 w-5" />}
          accent="amber"
        />
        <AdminMetricCard
          title={t('metrics.bounceRate')}
          value={formatPercent(analytics?.summary.bounceRate ?? 0)}
          hint={t('hints.bounceRate')}
          icon={<Activity className="h-5 w-5" />}
          accent="rose"
        />
        <AdminMetricCard
          title={t('metrics.averageSessionDuration')}
          value={toReadableDuration(analytics?.summary.averageSessionDurationSeconds ?? 0)}
          hint={t('hints.averageSessionDuration')}
          icon={<Clock3 className="h-5 w-5" />}
          accent="indigo"
        />
      </div>

      {analyticsState.loading && !analytics ? (
        <div className="rounded-3xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
          {t('loading')}
        </div>
      ) : analyticsState.error && !analytics ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
          {analyticsState.error}
        </div>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-2">
            <AdminPanel title={t('charts.dailyVisitorsTitle')} description={t('charts.dailyVisitorsDescription')}>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.dailyTraffic || []} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="visitors" stroke="#0f172a" strokeWidth={2} dot={false} name={t('legends.visitors')} />
                    <Line type="monotone" dataKey="sessions" stroke="#64748b" strokeWidth={2} dot={false} name={t('legends.sessions')} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </AdminPanel>

            <AdminPanel title={t('charts.trafficGrowthTitle')} description={t('charts.trafficGrowthDescription')}>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthSeries} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} unit="%" />
                    <Tooltip formatter={(value) => `${Number(Array.isArray(value) ? value[0] : value ?? 0)}%`} />
                    <Legend />
                    <Line type="monotone" dataKey="growthRate" stroke="#0284c7" strokeWidth={2} dot={false} name={t('legends.growthRate')} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </AdminPanel>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <AdminPanel title={t('charts.trafficSourcesTitle')} description={t('charts.trafficSourcesDescription')}>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sourceChartData} dataKey="value" nameKey="name" outerRadius={110} innerRadius={55}>
                      {sourceChartData.map((entry, index) => (
                        <Cell key={entry.name} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </AdminPanel>

            <AdminPanel title={t('charts.deviceUsageTitle')} description={t('charts.deviceUsageDescription')}>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deviceChartData} dataKey="value" nameKey="name" outerRadius={110} innerRadius={55}>
                      {deviceChartData.map((entry, index) => (
                        <Cell key={entry.name} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </AdminPanel>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <AdminPanel title={t('charts.topCountriesTitle')} description={t('charts.topCountriesDescription')}>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.topCountries || []} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0f172a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </AdminPanel>

            <AdminPanel title={t('charts.topPagesTitle')} description={t('charts.topPagesDescription')}>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.topPages || []} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="path" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="views" fill="#334155" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </AdminPanel>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <AdminPanel title={t('panels.topContentTitle')} description={t('panels.topContentDescription')}>
              <div className="space-y-3">
                {(analytics?.topContent || []).map((item, index) => (
                  <div key={`${item.path}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-slate-950" title={item.title || item.path}>{item.title || item.path}</p>
                    <p className="mt-1 truncate text-xs text-slate-500" title={item.path}>{item.path}</p>
                    <div className="mt-2 grid grid-cols-3 gap-3 text-xs text-slate-600">
                      <span>{t('table.views')}: {formatAdminNumber(item.views, locale)}</span>
                      <span>{t('table.engagement')}: {formatPercent(item.engagementRate)}</span>
                      <span>{t('table.duration')}: {toReadableDuration(item.avgEngagementSeconds)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </AdminPanel>

            <AdminPanel title={t('panels.landingPagesTitle')} description={t('panels.landingPagesDescription')}>
              <div className="space-y-3">
                {(analytics?.topLandingPages || []).map((item, index) => (
                  <div key={`${item.landingPage}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-slate-950" title={item.landingPage}>{item.landingPage}</p>
                    <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-slate-600 sm:grid-cols-4">
                      <span>{t('table.sessions')}: {formatAdminNumber(item.sessions, locale)}</span>
                      <span>{t('table.engagement')}: {formatPercent(item.engagementRate)}</span>
                      <span>{t('table.bounce')}: {formatPercent(item.bounceRate)}</span>
                      <span>{t('table.duration')}: {toReadableDuration(item.avgEngagementSeconds)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </AdminPanel>
          </div>

          <AdminPanel title={t('panels.audienceBreakdownTitle')} description={t('panels.audienceBreakdownDescription')}>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('audience.browsers')}</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {(analytics?.browserUsage || []).slice(0, 6).map((item) => (
                    <li key={item.label} className="flex items-center justify-between gap-3">
                      <span className="truncate">{item.label}</span>
                      <span className="font-semibold">{formatAdminNumber(item.sessions, locale)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('audience.operatingSystems')}</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {(analytics?.operatingSystemUsage || []).slice(0, 6).map((item) => (
                    <li key={item.label} className="flex items-center justify-between gap-3">
                      <span className="truncate">{item.label}</span>
                      <span className="font-semibold">{formatAdminNumber(item.sessions, locale)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('audience.referrers')}</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {(analytics?.referrers || []).slice(0, 6).map((item) => (
                    <li key={item.label} className="flex items-center justify-between gap-3">
                      <span className="truncate" title={item.label}>{item.label}</span>
                      <span className="font-semibold">{formatAdminNumber(item.sessions, locale)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </AdminPanel>
        </>
      )}

      {analytics?.generatedAt ? (
        <p className="text-right text-xs text-slate-500">{common('generatedAt')}: {new Date(analytics.generatedAt).toLocaleString()}</p>
      ) : null}
    </div>
  );
}
