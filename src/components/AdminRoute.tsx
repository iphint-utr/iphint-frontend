'use client';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from '@/i18n/routing';
import { RootState } from '@/lib/store/store';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, role } = useSelector((state: RootState) => state.user);
  const isAuthenticated = Boolean(token);
  const isAdmin = role === 'admin';

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (!isAdmin) {
      router.replace('/dashboard');
    }
  }, [isAdmin, isAuthenticated, router]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />
      </div>
    );
  }

  return <>{children}</>;
}