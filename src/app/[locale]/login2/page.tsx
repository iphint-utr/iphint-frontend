'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError, selectIsAuthenticated, selectAuthLoading } from '../../../lib/store/slices/userSlice';
import { AppDispatch, RootState } from '../../../lib/store/store';
import { Link, useRouter } from '@/i18n/routing';

export default function LoginPage() {
  const router = useRouter();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authLoading = useSelector(selectAuthLoading);
  
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading]);
  const t = useTranslations('Auth');
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.user);

  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(clearError());
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white font-sans text-gray-900">
      <div className="w-full max-w-[420px]">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-10 text-center text-black">
          {t('loginTitle')}
        </h1>
        
        {/* Google Auth Button */}
        <button className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3.5 sm:py-4 rounded-2xl hover:bg-gray-50 transition-all mb-8 text-sm sm:text-base font-medium">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {t('continueWithGoogle')}
        </button>

        <div className="relative flex items-center py-4 mb-4">
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div>
            <label className="block text-sm sm:text-base font-medium text-black mb-2">{t('emailOnlyLabel')}</label>
            <input 
              name="email" 
              type="email" 
              required 
              placeholder={t('loginEmailPlaceholder')} 
              value={formData.email} 
              onChange={handleChange}
              className="w-full p-3.5 sm:p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-black outline-none placeholder-gray-300 transition-all text-sm sm:text-base" 
            />
          </div>

          <div>
            <label className="block text-sm sm:text-base font-medium text-black mb-2">{t('passwordOnlyLabel')}</label>
            <input 
              name="password" 
              type="password" 
              required 
              placeholder={t('loginPasswordPlaceholder')} 
              value={formData.password} 
              onChange={handleChange}
              className="w-full p-3.5 sm:p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-black outline-none placeholder-gray-300 transition-all text-sm sm:text-base" 
            />
          </div>

          <div className="flex justify-start pt-1">
            <Link href="/forgot-password" className="text-sm font-semibold border-b border-black text-black pb-0.5 hover:text-gray-600 transition-colors">
              {t('forgetPassword')}
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white font-semibold py-4 sm:py-5 rounded-2xl mt-6 hover:bg-gray-900 transition-all disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? '...' : t('submitLogin')}
          </button>
        </form>

        <div className="mt-8 text-center text-sm sm:text-base text-black font-medium">
          {t('noAccountText')}{' '}
          <Link href="/register" className="font-semibold border-b border-black pb-0.5 ml-1 hover:text-gray-600 transition-colors">
            {t('noAccountLink')}
          </Link>
        </div>

        {error && (
          <div className="mt-8 bg-[#FFF1F0] text-[#D93025] p-4 rounded-xl flex items-center justify-center gap-2 border border-[#FEE2E2]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#D93025"/>
              <path d="M12 8V12M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}