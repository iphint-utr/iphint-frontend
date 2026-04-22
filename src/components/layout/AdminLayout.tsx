'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/adminLayout/Sidebar';
import AdminTopbar from '@/components/adminLayout/Topbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(min-width: 1024px)').matches;
    }

    return false;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={`transition-all duration-200 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        <AdminTopbar onMenuClick={() => setSidebarOpen((previous) => !previous)} />
        <main className="min-h-[calc(100vh-64px)] px-3 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}