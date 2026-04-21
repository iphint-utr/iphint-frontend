'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import PublicLayout from '@/components/layout/PublicLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import { routing } from '@/i18n/routing';

export default function AppLayoutRouter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const localePattern = routing.locales.join('|');
  const isDashboardRoute = new RegExp(`^\\/(?:${localePattern})\\/dashboard(\\/|$)`).test(pathname);
  const isAdminRoute = new RegExp(`^\\/(?:${localePattern})\\/admin(\\/|$)`).test(pathname);

  if (isDashboardRoute) {
    return (
      <ProtectedRoute>
        <DashboardLayout>{children}</DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (isAdminRoute) {
    return (
      <AdminRoute>
        <AdminLayout>{children}</AdminLayout>
      </AdminRoute>
    );
  }

  return <PublicLayout>{children}</PublicLayout>;
}
