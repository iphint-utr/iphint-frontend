'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import PublicLayout from '@/components/layout/PublicLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AppLayoutRouter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const isDashboardRoute = /^\/(en|kr)\/dashboard(\/|$)/.test(pathname);

  if (isDashboardRoute) {
    return (
      <ProtectedRoute>
        <DashboardLayout>{children}</DashboardLayout>
      </ProtectedRoute>
    );
  }

  return <PublicLayout>{children}</PublicLayout>;
}
