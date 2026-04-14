'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslations } from 'next-intl';
import { AppDispatch, RootState } from '@/lib/store/store'; // Adjust path to your store
import { fetchDashboardData, fetchAlerts } from '@/lib/store/slices/dashboardSlice';
import { StatCard } from '@/components/dashboard/StatCard';
import { NewScanBanner } from '@/components/dashboard/NewScanBanner';
import { CheckCircle2, ChevronRight, Bell, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const dispatch = useDispatch<AppDispatch>();
  const { stats, latestSearches, alerts, loading } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
    dispatch(fetchAlerts());
  }, [dispatch]);

  if (loading && !stats) {
    return <div className="p-8 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 lg:p-10 font-sans text-gray-900">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">
          {t('welcome', { name: 'John' })} {/* Replace 'John' with actual user name from auth state */}
        </h1>
        <p className="text-gray-500">{t('overview')}</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title={t('totalScans')} value={stats?.totalScans || 0} trend="+12%" />
        <StatCard title={t('matchesFound')} value={stats?.totalMatches || 0} trend="+8%" />
        <StatCard title={t('activeMonitors')} value={stats?.activeMonitors || 0} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Banner & Recent Scans) */}
        <div className="lg:col-span-2 space-y-8">
          <NewScanBanner t={t} />

          {/* Recent Scans */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">{t('recentScans')}</h3>
              <button className="text-sm text-[#8b5cf6] font-medium hover:underline">
                {t('viewAll')}
              </button>
            </div>
            
            <div className="space-y-4">
              {latestSearches.map((search) => (
                <div key={search.searchId} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border border-transparent hover:border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden">
                      <img src={search.image} alt="scan" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{search.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(search.time).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{search.resultCount} {t('matches')}</p>
                      <p className="text-xs text-emerald-600 flex items-center justify-end gap-1">
                        <CheckCircle2 size={12} /> {t(search.status)}
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                </div>
              ))}
              {latestSearches.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No recent scans found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Alerts & Quick Actions) */}
        <div className="space-y-8">
          
          {/* Recent Alerts */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4">{t('recentAlerts')}</h3>
            <div className="space-y-4 mb-4">
              {alerts.slice(0, 3).map((alert, index) => (
                <div key={alert._id} className="flex gap-3 items-start">
                  <div className="mt-1 text-amber-500">
                    {index === 0 ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} className="text-emerald-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{alert.title}</p>
                    <p className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full text-center text-sm text-[#8b5cf6] font-medium hover:underline pt-2 border-t border-gray-50">
              {t('viewAllAlerts')}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4">{t('quickActions')}</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-100 transition-colors">
                {t('newScanAction')}
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-100 transition-colors">
                {t('viewMonitoringAction')}
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-100 transition-colors">
                {t('generateReportAction')}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}