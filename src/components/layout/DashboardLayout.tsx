'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/dashboardLayout/Sidebar';
import Topbar from '@/components/dashboardLayout/Topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(min-width: 1024px)').matches;
    }
    return false;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={`transition-all duration-200 ${sidebarOpen ? 'lg:ml-60' : 'lg:ml-0'}`}>
        <Topbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />
        <main className="min-h-[calc(100vh-64px)] px-6 py-6">
          <div className="mx-auto w-full space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
