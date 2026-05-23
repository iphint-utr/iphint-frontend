'use client';

import { useEffect } from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function GoogleSuccessInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      // No token — something went wrong, redirect to login with error
      window.location.replace('/login?error=google_auth_failed');
      return;
    }

    // 1. Persist token to localStorage so Redux hydrates on next load
    localStorage.setItem('token', token);

    // 2. Immediately strip the token from the URL bar (security hygiene)
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      window.history.replaceState(null, '', window.location.pathname);
    }

    // 3. Hard-navigate to user dashboard so Redux re-hydrates from localStorage
    window.location.replace('/user');
  }, [searchParams]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-gray-900" />
    </div>
  );
}

export default function GoogleSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-white">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-gray-900" />
        </div>
      }
    >
      <GoogleSuccessInner />
    </Suspense>
  );
}
