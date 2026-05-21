'use client';

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { LayoutDashboard, Search, Activity, CreditCard, Settings, LogOut, UserCircle2, FileText, Crown, Users, ShieldCheck } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logout } from '@/lib/store/slices/userSlice';
import { fetchSubscriptionSnapshot } from '@/lib/store/slices/accountSlice';

const closeOnMobileOnly = (onClose: () => void) => {
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    onClose();
  }
};

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const adminT = useTranslations('Admin');
  const dashboardT = useTranslations('Dashboard');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector((state) => state.user);
  const subscriptionSnapshot = useAppSelector((state) => state.account.subscription.data);
  const planInfo = {
    name: subscriptionSnapshot?.plan?.name || 'Starter',
    tier: subscriptionSnapshot?.plan?.tier || 'starter',
    subscriptionStatus: subscriptionSnapshot?.subscription?.status || null,
  };
  const menu = [
    { label: dashboardT('sidebar.dashboard'), href: '/user', icon: LayoutDashboard },
    { label: dashboardT('sidebar.searches'), href: '/user/searches', icon: Search },
    { label: dashboardT('sidebar.monitoring'), href: '/user/monitoring', icon: Activity },
    { label: dashboardT('sidebar.reports'), href: '/user/reports', icon: FileText },
    { label: dashboardT('sidebar.referral'), href: '/user/referral', icon: Users },
    { label: dashboardT('sidebar.billing'), href: '/user/billing', icon: CreditCard },
    { label: dashboardT('sidebar.settings'), href: '/user/settings', icon: Settings },
  ];

  const displayName = user.name || 'User';
  const company = user.role || 'Organization';
  const isAdmin = user.role === 'admin';
  const showUpgradeAction = planInfo.tier === 'starter' || planInfo.subscriptionStatus === 'cancelled' || planInfo.subscriptionStatus === 'expired';

  const isItemActive = (href: string) => {
    if (href === '/user') return pathname === '/user';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/login');
  };

  useEffect(() => {
    dispatch(fetchSubscriptionSnapshot());
  }, [dispatch]);

  return (
    <>
      {open && (
        <button
          aria-label="Close sidebar overlay"
          className="fixed inset-x-0 bottom-0 top-16 z-30 bg-black/20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'fixed left-0 top-16 z-40 h-[calc(100vh-64px)] w-60 border-r border-gray-200 bg-white shadow-sm transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex h-full flex-col">
          <nav className="flex-1 px-3 py-4 space-y-1">
            {menu.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => closeOnMobileOnly(onClose)}
                  className={[
                    'flex items-center gap-3 rounded-lg px-4 py-2 text-sm leading-5 font-medium transition-colors',
                    active
                      ? 'bg-gray-100 text-black'
                      : 'text-gray-700 hover:bg-gray-50',
                  ].join(' ')}
                >
                  <Icon size={18} strokeWidth={2} className={active ? 'text-gray-900' : 'text-gray-500'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-200 px-3 py-3">
            <div className="mb-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{dashboardT('sidebar.currentPlan')}</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-gray-900">{planInfo.name}</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                  <Crown className="h-3 w-3" />
                  {planInfo.tier.toUpperCase()}
                </span>
              </div>

              {showUpgradeAction && (
                <button
                  type="button"
                  onClick={() => {
                    closeOnMobileOnly(onClose);
                    router.push('/user/billing');
                  }}
                  className="mt-2 w-full rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                >
                  {planInfo.subscriptionStatus === 'cancelled' || planInfo.subscriptionStatus === 'expired'
                    ? dashboardT('sidebar.renewPlan')
                    : dashboardT('sidebar.upgradePlan')}
                </button>
              )}
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  closeOnMobileOnly(onClose);
                  router.push('/admin');
                }}
                className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm leading-5 font-medium text-white hover:bg-gray-800"
              >
                <ShieldCheck size={16} strokeWidth={2} className="text-white" />
                <span>{adminT('common.goToAdmin')}</span>
              </button>
            )}

            <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
              <UserCircle2 className="h-8 w-8 text-gray-500" strokeWidth={1.8} />
              <div className="min-w-0">
                <p className="truncate text-sm leading-5 font-medium text-gray-900">{displayName}</p>
                <p className="truncate text-xs leading-4 text-gray-500">{company}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-5 font-medium text-gray-700 hover:bg-gray-50"
            >
              <LogOut size={16} strokeWidth={2} className="text-gray-600" />
              <span>{dashboardT('sidebar.logout')}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
