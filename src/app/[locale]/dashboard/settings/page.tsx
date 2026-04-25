'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Bell, CheckCircle2, Mail, RefreshCcw, Search, Shield, Trash2, UserCircle2 } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

const apiClient = axios.create({ baseURL: `${BASE_URL}/api/v1` });
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type SummaryFrequency = 'instant' | 'daily' | 'weekly';

interface SettingsProfile {
  name: string;
  email: string;
  affiliation: string;
  jobTitle: string;
  country: string;
  phoneNumber: string;
  role: string;
  joiningDate: string;
}

interface SettingsNotifications {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  weeklyRescanEnabled: boolean;
  notifyOnNewMatches: boolean;
  summaryFrequency: SummaryFrequency;
}

interface NotificationItem {
  _id: string;
  title: string;
  message?: string;
  type?: string;
  isRead?: boolean;
  timestamp: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settingsSection, setSettingsSection] = useState<'profile' | 'notifications'>('profile');

  const [profile, setProfile] = useState<SettingsProfile>({
    name: '',
    email: '',
    affiliation: '',
    jobTitle: '',
    country: '',
    phoneNumber: '',
    role: '',
    joiningDate: '',
  });

  const [notificationPrefs, setNotificationPrefs] = useState<SettingsNotifications>({
    emailEnabled: true,
    inAppEnabled: true,
    weeklyRescanEnabled: true,
    notifyOnNewMatches: true,
    summaryFrequency: 'instant',
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread'>('all');
  const [notificationQuery, setNotificationQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const [profileSaving, setProfileSaving] = useState(false);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const joinDateLabel = useMemo(() => {
    if (!profile.joiningDate) return 'N/A';
    const date = new Date(profile.joiningDate);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString();
  }, [profile.joiningDate]);

  const showMessage = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setSuccess('');
      return;
    }
    setSuccess(msg);
    setError('');
  };

  const loadSettings = async () => {
    const { data } = await apiClient.get('/user-details/settings');
    const settings = data?.settings || {};
    setProfile(settings.profile || profile);
    setNotificationPrefs(settings.notifications || notificationPrefs);
    setUnreadCount(settings.unreadNotifications || 0);
  };

  const loadNotifications = async (status: 'all' | 'unread', q = '') => {
    const { data } = await apiClient.get('/user-details/notifications', {
      params: { status, q, page: 1, limit: 20 },
    });
    setNotifications(data?.notifications || []);
    setUnreadCount(data?.unreadCount || 0);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        setError('');
        await Promise.all([loadSettings(), loadNotifications('all', '')]);
      } catch (err: any) {
        showMessage(err?.response?.data?.message || 'Failed to load settings', true);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setProfileSaving(true);
      await apiClient.patch('/user-details/settings/profile', profile);
      showMessage('Profile updated successfully.');
    } catch (err: any) {
      showMessage(err?.response?.data?.message || 'Could not update profile.', true);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setPrefsSaving(true);
      await apiClient.patch('/user-details/settings/notifications', notificationPrefs);
      showMessage('Notification preferences saved.');
    } catch (err: any) {
      showMessage(err?.response?.data?.message || 'Could not update notification preferences.', true);
    } finally {
      setPrefsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('New password and confirmation do not match.', true);
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      showMessage('New password must be at least 8 characters.', true);
      return;
    }

    try {
      setPasswordSaving(true);
      await apiClient.patch('/user-details/settings/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showMessage('Password updated successfully.');
    } catch (err: any) {
      showMessage(err?.response?.data?.message || 'Could not update password.', true);
    } finally {
      setPasswordSaving(false);
    }
  };

  const applyNotificationFilter = async (status: 'all' | 'unread') => {
    setNotificationFilter(status);
    try {
      await loadNotifications(status, notificationQuery);
    } catch {
      showMessage('Failed to load notifications.', true);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await apiClient.delete(`/user-details/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      showMessage('Notification deleted.');
    } catch {
      showMessage('Could not delete notification.', true);
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      await apiClient.delete('/user-details/notifications');
      setNotifications([]);
      setUnreadCount(0);
      showMessage('All notifications deleted.');
    } catch {
      showMessage('Could not delete all notifications.', true);
    }
  };

  const handleNotificationSearch = async () => {
    try {
      await loadNotifications(notificationFilter, notificationQuery);
    } catch {
      showMessage('Failed to search notifications.', true);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await apiClient.patch(`/user-details/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (notificationFilter === 'unread') {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
      }
    } catch {
      showMessage('Could not update notification.', true);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.patch('/user-details/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      if (notificationFilter === 'unread') {
        setNotifications([]);
      }
      showMessage('All notifications marked as read.');
    } catch {
      showMessage('Could not mark all notifications as read.', true);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-100" />
        <div className="h-52 animate-pulse rounded-2xl bg-white border border-gray-100" />
        <div className="h-52 animate-pulse rounded-2xl bg-white border border-gray-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your profile, security, and notification channels from one place.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
            Unread notifications: <span className="font-semibold text-gray-900">{unreadCount}</span>
          </div>
        </div>

        <div className="mt-4 inline-flex flex-wrap gap-2" role="tablist" aria-label="Settings sections">
          <button
            type="button"
            role="tab"
            aria-selected={settingsSection === 'profile'}
            onClick={() => setSettingsSection('profile')}
            className={[
              'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
              settingsSection === 'profile'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900',
            ].join(' ')}
          >
            <UserCircle2 className="h-4 w-4" />
            Profile & Security
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={settingsSection === 'notifications'}
            onClick={() => setSettingsSection('notifications')}
            className={[
              'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
              settingsSection === 'notifications'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900',
            ].join(' ')}
          >
            <Bell className="h-4 w-4" />
            Notifications
            {unreadCount > 0 && (
              <span
                className={[
                  'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  settingsSection === 'notifications' ? 'bg-white/20 text-white' : 'bg-gray-900 text-white',
                ].join(' ')}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      {settingsSection === 'profile' && (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2 text-gray-900">
          <UserCircle2 className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Profile</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="text-sm text-gray-600">
            Full Name
            <input
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
            />
          </label>

          <label className="text-sm text-gray-600">
            Email
            <input
              value={profile.email}
              disabled
              className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
            />
          </label>

          <label className="text-sm text-gray-600">
            Organization
            <input
              value={profile.affiliation}
              onChange={(e) => setProfile((p) => ({ ...p, affiliation: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
            />
          </label>

          <label className="text-sm text-gray-600">
            Job Title
            <input
              value={profile.jobTitle}
              onChange={(e) => setProfile((p) => ({ ...p, jobTitle: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
            />
          </label>

          <label className="text-sm text-gray-600">
            Country
            <input
              value={profile.country}
              onChange={(e) => setProfile((p) => ({ ...p, country: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
            />
          </label>

          <label className="text-sm text-gray-600">
            Phone Number
            <input
              value={profile.phoneNumber}
              onChange={(e) => setProfile((p) => ({ ...p, phoneNumber: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span>Role: {profile.role || 'general'}</span>
          <span>Joined: {joinDateLabel}</span>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={profileSaving}
          className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {profileSaving ? 'Saving...' : 'Save Profile'}
        </button>
      </section>
      )}

      {settingsSection === 'notifications' && (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2 text-gray-900">
          <Mail className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Notifications & Weekly Monitoring</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
            Email notifications
            <input
              type="checkbox"
              checked={notificationPrefs.emailEnabled}
              onChange={(e) => setNotificationPrefs((p) => ({ ...p, emailEnabled: e.target.checked }))}
            />
          </label>

          <label className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
            In-app notifications
            <input
              type="checkbox"
              checked={notificationPrefs.inAppEnabled}
              onChange={(e) => setNotificationPrefs((p) => ({ ...p, inAppEnabled: e.target.checked }))}
            />
          </label>

          <label className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
            Weekly re-scan on uploaded images
            <input
              type="checkbox"
              checked={notificationPrefs.weeklyRescanEnabled}
              onChange={(e) => setNotificationPrefs((p) => ({ ...p, weeklyRescanEnabled: e.target.checked }))}
            />
          </label>

          <label className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
            Notify only when new matches appear
            <input
              type="checkbox"
              checked={notificationPrefs.notifyOnNewMatches}
              onChange={(e) => setNotificationPrefs((p) => ({ ...p, notifyOnNewMatches: e.target.checked }))}
            />
          </label>

          <label className="text-sm text-gray-600">
            Digest frequency
            <select
              value={notificationPrefs.summaryFrequency}
              onChange={(e) =>
                setNotificationPrefs((p) => ({ ...p, summaryFrequency: e.target.value as SummaryFrequency }))
              }
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
            >
              <option value="instant">Instant</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </label>
        </div>

        <button
          onClick={handleSavePreferences}
          disabled={prefsSaving}
          className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {prefsSaving ? 'Saving...' : 'Save Preferences'}
        </button>
      </section>
      )}

      {settingsSection === 'profile' && (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2 text-gray-900">
          <Shield className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Security</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="text-sm text-gray-600">
            Current Password
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
            />
          </label>
          <label className="text-sm text-gray-600">
            New Password
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
            />
          </label>
          <label className="text-sm text-gray-600">
            Confirm Password
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
            />
          </label>
        </div>

        <button
          onClick={handleUpdatePassword}
          disabled={passwordSaving}
          className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {passwordSaving ? 'Updating...' : 'Update Password'}
        </button>
      </section>
      )}

      {settingsSection === 'notifications' && (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-gray-900">
            <Bell className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Notification Inbox</h2>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">Unread: {unreadCount}</span>
            <button
              onClick={handleMarkAllRead}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
            >
              Mark all read
            </button>
            <button
              onClick={handleDeleteAllNotifications}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50"
            >
              Delete all
            </button>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={notificationQuery}
              onChange={(e) => setNotificationQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNotificationSearch();
              }}
              placeholder="Search alerts"
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-gray-400"
            />
          </div>
          <button
            onClick={handleNotificationSearch}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Search
          </button>
          <button
            onClick={() => applyNotificationFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-sm ${notificationFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            All
          </button>
          <button
            onClick={() => applyNotificationFilter('unread')}
            className={`rounded-lg px-3 py-1.5 text-sm ${notificationFilter === 'unread' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Unread
          </button>
          <button
            onClick={() => applyNotificationFilter(notificationFilter)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
              No notifications found for this filter.
            </p>
          ) : (
            notifications.map((item) => (
              <div
                key={item._id}
                className={`rounded-xl border px-4 py-3 ${item.isRead ? 'border-gray-200 bg-white' : 'border-emerald-200 bg-emerald-50/40'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    {item.message && <p className="mt-1 text-sm text-gray-600">{item.message}</p>}
                    <p className="mt-2 text-xs text-gray-400">{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkRead(item._id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2.5 py-1 text-xs text-emerald-700 hover:bg-emerald-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(item._id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      )}
    </div>
  );
}
