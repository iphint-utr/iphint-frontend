'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import PublicLayout from '@/components/layout/PublicLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import { routing } from '@/i18n/routing';
import Header from '@/components/navbar';
import Footer from '@/components/footer';

const publicChromePaths = new Set([
  '/',
  '/login',
  '/login2',
  '/register',
  '/signup2',
  '/privacy_policy',
  '/terms_of_service',
]);

export default function AppLayoutRouter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const localePattern = routing.locales.join('|');
  const localelessPath = pathname.replace(new RegExp(`^\/(?:${localePattern})(?=\/|$)`), '') || '/';
  const normalizedPath = localelessPath !== '/' && localelessPath.endsWith('/')
    ? localelessPath.slice(0, -1)
    : localelessPath;
  const isDashboardRoute = normalizedPath === '/dashboard' || normalizedPath.startsWith('/dashboard/');
  const isAdminRoute = normalizedPath === '/admin' || normalizedPath.startsWith('/admin/');
  const shouldShowPublicChrome = publicChromePaths.has(normalizedPath);

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

  const content = <PublicLayout>{children}</PublicLayout>;

  if (!shouldShowPublicChrome) {
    return content;
  }

  return (
    <>
      <Header />
      {content}
      <Footer />
    </>
  );
}
