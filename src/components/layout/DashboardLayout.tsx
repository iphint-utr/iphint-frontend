'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Sidebar from '@/components/dashboardLayout/Sidebar';
import Topbar from '@/components/dashboardLayout/Topbar';

const desktopSidebarMediaQuery = '(min-width: 1024px)';

const subscribeToDesktopSidebar = (callback: () => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const mediaQueryList = window.matchMedia(desktopSidebarMediaQuery);
  mediaQueryList.addEventListener('change', callback);

  return () => {
    mediaQueryList.removeEventListener('change', callback);
  };
};

const getDesktopSidebarSnapshot = () => window.matchMedia(desktopSidebarMediaQuery).matches;
const getDesktopSidebarServerSnapshot = () => false;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const isDesktopSidebar = useSyncExternalStore(
    subscribeToDesktopSidebar,
    getDesktopSidebarSnapshot,
    getDesktopSidebarServerSnapshot,
  );
  const sidebarOpen = isDesktopSidebar ? desktopSidebarOpen : mobileSidebarOpen;

  const handleSidebarToggle = () => {
    if (isDesktopSidebar) {
      setDesktopSidebarOpen((previous) => !previous);
      return;
    }

    setMobileSidebarOpen((previous) => !previous);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Sidebar open={sidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      <div className={`transition-all duration-200 ${isDesktopSidebar && sidebarOpen ? 'lg:ml-60' : 'lg:ml-0'}`}>
        <Topbar onMenuClick={handleSidebarToggle} />

        <main className="min-h-screen px-4 py-5 sm:px-6 sm:py-6">
          <div className="mx-auto w-full space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
