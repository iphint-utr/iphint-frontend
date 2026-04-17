'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { selectToken } from '@/lib/store/slices/userSlice';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = useSelector(selectToken);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = params?.locale || 'en';
  
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Wait for client-side mount
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    // 2. Define the target path to avoid circular redirects
    const targetPath = `/${locale}/signup2`;

    // 3. Only redirect if there is NO token AND we aren't already on the signup page
    if (!token && pathname !== targetPath) {
      router.replace(targetPath);
    }
  }, [isReady, token, router, pathname, locale]);

  // While waiting for mount or if no token, show a clean loader
  // This prevents the "infinite hang" by ensuring something is rendered
  if (!isReady || (!token && pathname !== `/${locale}/signup2`)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-[#6366f1]" />
      </div>
    );
  }

  return <>{children}</>;
}