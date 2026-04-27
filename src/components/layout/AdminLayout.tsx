'use client';

import React, { useState, useSyncExternalStore } from 'react';
import AdminSidebar from '@/components/adminLayout/Sidebar';
import SidebarToggleButton from '@/components/layout/SidebarToggleButton';

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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <AdminSidebar open={sidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      <div className={`transition-all duration-200 ${isDesktopSidebar ? 'lg:ml-72' : 'lg:ml-0'}`}>
        <div className="sticky top-16 z-20 px-3 pt-4 sm:px-6 lg:px-8">
          <SidebarToggleButton isOpen={sidebarOpen} onClick={handleSidebarToggle} />
        </div>

        <main className="min-h-screen px-3 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}