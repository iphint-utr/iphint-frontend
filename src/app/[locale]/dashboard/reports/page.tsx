'use client';

import React, { useEffect, useState } from 'react';
import { Download, Eye, FileText, Image as ImageIcon, Lock } from 'lucide-react';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

const apiClient = axios.create({ baseURL: `${BASE_URL}/api/v1` });
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface Report {
  searchId: string;
  image: string;
  date: string;
  matchCount: number;
}

interface PlanLimits {
  tier: 'starter' | 'pro' | 'premium';
  maxResults: number;
  imageUploadLimit: number;
  pdfEnabled: boolean;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, 'download' | 'preview' | null>>({});

  useEffect(() => {
    Promise.all([
      apiClient.get('/user-details/reports'),
      apiClient.get('/billing/plan-limits'),
    ])
      .then(([reportsRes, limitsRes]) => {
        setReports(reportsRes.data?.reports || []);
        setPlanLimits(limitsRes.data || null);
      })
      .catch(() => setError('Failed to load reports. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const estimatedPages = (matchCount: number) => Math.max(1, Math.ceil(matchCount / 3));

  const handleAction = async (searchId: string, action: 'download' | 'preview') => {
    if (planLimits && !planLimits.pdfEnabled) {
      setUpgradeModalOpen(true);
      return;
    }

    setActionLoading((prev) => ({ ...prev, [searchId]: action }));
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const url = `${BASE_URL}/api/v1/pdf/${action}/${searchId}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      if (action === 'download') {
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = `report_${searchId}.pdf`;
        a.click();
      } else {
        window.open(objectUrl, '_blank');
      }

      URL.revokeObjectURL(objectUrl);
    } catch {
      alert('Could not generate PDF. Please try again.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [searchId]: null }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate branded PDF evidence reports from your reverse image search results.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-4 h-36 rounded-lg bg-gray-100" />
              <div className="mb-2 h-4 w-2/3 rounded bg-gray-100" />
              <div className="h-3 w-1/2 rounded bg-gray-100" />
              <div className="mt-4 flex gap-2">
                <div className="h-9 flex-1 rounded-lg bg-gray-100" />
                <div className="h-9 flex-1 rounded-lg bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : planLimits && !planLimits.pdfEnabled ? (
        <div className="flex min-h-96 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 text-center">
          <div className="mb-4 rounded-2xl bg-gray-100 p-4">
            <Lock className="h-8 w-8 text-gray-700" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">PDF reports are locked on your current plan</h2>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            Upgrade your plan to unlock report preview and download. Pro and Premium include full PDF exports.
          </p>
          <button
            type="button"
            onClick={() => (window.location.href = '/dashboard/billing')}
            className="mt-5 inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Upgrade plan to unlock this feature
          </button>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center">
          <FileText className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-600">No reports yet</p>
          <p className="mt-1 text-xs text-gray-400">Run an image search to generate your first report.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => {
            const pages = estimatedPages(report.matchCount);
            const isDownloading = actionLoading[report.searchId] === 'download';
            const isPreviewing = actionLoading[report.searchId] === 'preview';

            return (
              <div
                key={report.searchId}
                className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="relative h-36 bg-gray-50">
                  {report.image ? (
                    <img
                      src={report.image}
                      alt="Search image"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <p className="truncate text-sm font-semibold text-gray-900">
                      Search Report
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                      <span>{new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="text-gray-300">•</span>
                      <span>{report.matchCount} {report.matchCount === 1 ? 'match' : 'matches'}</span>
                      <span className="text-gray-300">•</span>
                      <span>{pages} {pages === 1 ? 'page' : 'pages'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAction(report.searchId, 'download')}
                      disabled={isDownloading || isPreviewing || (planLimits ? !planLimits.pdfEnabled : false)}
                      className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {isDownloading ? 'Generating…' : 'Download'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(report.searchId, 'preview')}
                      disabled={isDownloading || isPreviewing || (planLimits ? !planLimits.pdfEnabled : false)}
                      className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-800 bg-gray-800 px-3 py-2 text-xs font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {isPreviewing ? 'Opening…' : 'Preview'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {upgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mx-auto mb-3 w-fit rounded-2xl bg-gray-100 p-3">
              <Lock className="h-6 w-6 text-gray-700" />
            </div>
            <h3 className="text-center text-lg font-semibold text-gray-900">Feature unavailable on current plan</h3>
            <p className="mt-2 text-center text-sm text-gray-500">
              PDF reports are available on Pro and Premium. Upgrade now to export and share professional reports.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setUpgradeModalOpen(false)}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Maybe later
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = '/dashboard/billing')}
                className="flex-1 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Upgrade plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
