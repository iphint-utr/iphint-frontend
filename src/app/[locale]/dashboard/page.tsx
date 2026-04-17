'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslations } from 'next-intl';
import { AppDispatch, RootState } from '@/lib/store/store'; 
import { fetchDashboardData, fetchAlerts } from '@/lib/store/slices/dashboardSlice';
import { StatCard } from '@/components/dashboard/StatCard';
import { NewScanBanner } from '@/components/dashboard/NewScanBanner';
import { 
  CheckCircle2, 
  ChevronRight, 
  AlertTriangle, 
  UserPlus, 
  Check, 
  Copy 
} from 'lucide-react';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const dispatch = useDispatch<AppDispatch>();
  
  // Get user data for name and referral code
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats, latestSearches, alerts, loading } = useSelector((state: RootState) => state.dashboard);

  // State for copy feedback
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboardData());
    dispatch(fetchAlerts());
  }, [dispatch]);

  // Fail-safe copy logic for all devices
  const handleCopyReferral = async () => {
    const code = user?.referralCode || 'WELCOME';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const referralUrl = `${baseUrl}/signup?ref=${code}`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(referralUrl);
      } else {
        // Fallback for non-HTTPS or older mobile browsers
        const textArea = document.createElement("textarea");
        textArea.value = referralUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error(`Failed to copy: ${referralUrl}`, err);
    }
  };

  if (loading && !stats) {
    return <div className="p-8 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 lg:p-10 font-sans text-gray-900">
      
      {/* --- HEADER WITH POPPING BUTTON --- */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-col items-left gap-4 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight text-black">
              {t('welcome', { name: user?.name || 'User' })}
            </h1>
            <p className="text-gray-500 mt-1">{t('overview')}</p>
            <button
              onClick={handleCopyReferral}
              className={`
                group relative flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300
                ${copied 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                  : 'bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#ec4899] text-white shadow-xl hover:shadow-[#a855f7]/40 hover:-translate-y-0.5 active:scale-95'
                }
              `}
            >
              {/* Ping Animation for "Popping" visibility */}
              {!copied && (
                <span className="absolute inset-0 rounded-full bg-white  opacity-20 pointer-events-none"></span>
              )}
              
              {copied ? (
                <>
                  <Check size={14} strokeWidth={3} className="animate-bounce" />
                  <span>{t('copied') || 'Copied!'}</span>
                </>
              ) : (
                <>
                  <UserPlus size={14} strokeWidth={3} />
                  <span>{t('referralLink') || 'Referral Link'}</span>
                  <Copy size={12} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </button>
          </div>
          
        </div>
      </div>

      {/* --- STATS ROW --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title={t('totalScans')} value={stats?.totalScans || 0} />
        <StatCard title={t('matchesFound')} value={stats?.totalMatches || 0} />
        <StatCard title={t('activeMonitors')} value={stats?.activeMonitors || 0} />
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Banner & Recent Scans */}
        <div className="lg:col-span-2 space-y-8">
          <NewScanBanner t={t} />

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-black">{t('recentScans')}</h3>
              <button className="text-sm text-[#8b5cf6] font-bold hover:underline">
                {t('viewAll')}
              </button>
            </div>
            
            <div className="space-y-4">
              {latestSearches.map((search) => (
                <div key={search.searchId} className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-200 rounded-lg overflow-hidden shrink-0 shadow-sm">
                      <img src={search.image} alt="scan" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-[#6366f1] transition-colors">{search.fileName}</p>
                      <p className="text-xs text-gray-400 mt-0.5 font-medium">
                        {new Date(search.time).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="font-bold text-gray-900">{search.resultCount} {t('matches')}</p>
                      <p className="text-[10px] text-emerald-600 flex items-center justify-end gap-1 font-black uppercase tracking-wider">
                        <CheckCircle2 size={12} /> {t(search.status)}
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-gray-300 group-hover:text-black transition-colors" />
                  </div>
                </div>
              ))}
              {latestSearches.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-10 italic">No recent scans found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Alerts & Quick Actions */}
        <div className="space-y-8">
          
          {/* Recent Alerts */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h3 className="text-xl font-bold mb-6 text-black">{t('recentAlerts')}</h3>
            <div className="space-y-6 mb-6">
              {alerts.slice(0, 3).map((alert, index) => (
                <div key={alert._id} className="flex gap-4 items-start">
                  <div className={`mt-1 p-2 rounded-lg ${index === 0 ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    {index === 0 ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-snug">{alert.title}</p>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full text-center text-sm text-[#8b5cf6] font-bold hover:underline pt-4 border-t border-gray-50">
              {t('viewAllAlerts')}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h3 className="text-xl font-bold mb-6 text-black">{t('quickActions')}</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-5 py-4 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 border border-gray-100 transition-all hover:border-[#8b5cf6]/30">
                {t('newScanAction')}
              </button>
              <button className="w-full text-left px-5 py-4 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 border border-gray-100 transition-all hover:border-[#8b5cf6]/30">
                {t('viewMonitoringAction')}
              </button>
              <button className="w-full text-left px-5 py-4 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 border border-gray-100 transition-all hover:border-[#8b5cf6]/30">
                {t('generateReportAction')}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}