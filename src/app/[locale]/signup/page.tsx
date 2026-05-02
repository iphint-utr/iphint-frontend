'use client';

import { useState, useEffect, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../../lib/store/slices/userSlice';
import { AppDispatch, RootState } from '../../../lib/store/store';
import { countries } from './countries';
import { useRouter } from '@/i18n/routing';
import { selectIsAuthenticated, selectAuthLoading } from '../../../lib/store/slices/userSlice';



// We separate the form logic to safely use useSearchParams inside a Suspense boundary
function SignupForm() {
  const t = useTranslations('Auth');
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref') || searchParams.get('referralCode') || '';
  const dispatch = useDispatch<AppDispatch>();
  const { authError } = useSelector((state: RootState) => state.user);
const router = useRouter();
const isAuthenticated = useSelector(selectIsAuthenticated);
const authLoading = useSelector(selectAuthLoading);

useEffect(() => {
  if (!authLoading && isAuthenticated) {
    router.push('/dashboard');
  }
}, [isAuthenticated, authLoading, router]);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    specificRole: '',
    country: 'KR',
    phoneCode: '+82',
    phoneNumber: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    dispatch(clearError());
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullPhone = `${formData.phoneCode}${formData.phoneNumber}`;
    
    // 2. Explicitly package the referral code into the body sent to the Thunk/Axios
    const submitData = {
      name: formData.name,
      companyName: formData.companyName,
      specificRole: formData.specificRole,
      country: formData.country,
      phoneNumber: fullPhone,
      email: formData.email,
      password: formData.password,
      referralCode // Passed directly to backend
    };
    
    dispatch(registerUser(submitData));

  };

  const uniqueDialCodes = Array.from(new Set(countries.map(c => c.dial)))
    .map(dial => countries.find(c => c.dial === dial))
    .sort((a, b) => (a!.dial > b!.dial ? 1 : -1));

  return (
    <div className="w-full max-w-[800px]">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-10 text-black">{t('signupTitle')}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Name */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-black mb-2">{t('nameLabel')}</label>
            <input 
              name="name" type="text" required placeholder={t('namePlaceholder')} 
              value={formData.name} onChange={handleChange}
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none placeholder-gray-300 transition-all text-sm sm:text-base" 
            />
          </div>

          {/* Business Environment */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-black mb-2">{t('businessLabel')}</label>
            <input 
              name="companyName" type="text" placeholder={t('businessPlaceholder')} 
              value={formData.companyName} onChange={handleChange}
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none placeholder-gray-300 transition-all text-sm sm:text-base" 
            />
          </div>

          {/* Specific Role */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-black mb-2">{t('roleLabel')}</label>
            <input 
              name="specificRole" type="text" placeholder={t('rolePlaceholder')} 
              value={formData.specificRole} onChange={handleChange}
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none placeholder-gray-300 transition-all text-sm sm:text-base" 
            />
          </div>

          {/* Alert Contact Info */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-black mb-2">{t('contactLabel')}</label>
            <div className="flex border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-black transition-all bg-white">
              <select 
                name="phoneCode" value={formData.phoneCode} onChange={handleChange} 
                className="p-3 sm:p-4 bg-transparent border-r border-gray-300 outline-none cursor-pointer min-w-[80px] sm:min-w-[100px] text-sm sm:text-base appearance-none"
              >
                {uniqueDialCodes.map((country, idx) => (
                  <option key={idx} value={country!.dial}>{country!.dial}</option>
                ))}
              </select>
              <input 
                name="phoneNumber" type="tel" placeholder="010-0000-0000" 
                value={formData.phoneNumber} onChange={handleChange}
                className="w-full p-3 sm:p-4 outline-none placeholder-gray-300 text-sm sm:text-base" 
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-black mb-2">{t('countryLabel')}</label>
            <div className="relative">
              <select 
                name="country" value={formData.country} onChange={handleChange}
                className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none appearance-none bg-white cursor-pointer text-sm sm:text-base transition-all"
              >
                <option value="KR">대한민국 KR</option>
                <option disabled>──────────</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name} {country.code}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-black mb-2">{t('emailLabel')}</label>
            <input 
              name="email" type="email" required placeholder={t('emailPlaceholder')} 
              value={formData.email} onChange={handleChange}
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none placeholder-gray-300 transition-all text-sm sm:text-base" 
            />
          </div>

          {/* Password */}
          <div className="md:col-span-2">
            <label className="block text-sm sm:text-base font-semibold text-black mb-2">{t('passwordLabel')}</label>
            <input 
              name="password" type="password" required placeholder={t('passwordPlaceholder')} 
              value={formData.password} onChange={handleChange}
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none placeholder-gray-300 transition-all text-sm sm:text-base" 
            />
          </div>
        </div>

        {/* Hidden Referral Code input (Optional: for visual confirmation in DOM) */}
        <input type="hidden" name="referralCode" value={referralCode} />

        {authError && (
          <div className="text-red-600 bg-red-50 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#EF4444"/>
              <path d="M12 8V12M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {authError}
          </div>
        )}

        <div className="flex justify-center mt-10">
          <button 
            type="submit" 
            disabled={authLoading}
            className="w-full md:w-[400px] bg-black text-white font-semibold py-4 sm:py-5 rounded-2xl hover:bg-gray-900 transition-all disabled:opacity-50 text-sm sm:text-base"
          >
            {authLoading ? '...' : t('submitSignup')}
          </button>
        </div>
      </form>
    </div>
  );
}

// 3. Export Default Component wrapped in Suspense
export default function SignupPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div
          aria-hidden="true"
          className="min-h-[280px] bg-slate-100 bg-cover bg-center bg-no-repeat lg:min-h-screen"
          style={{ backgroundImage: "url('/signup2.svg')" }}
        />

        <div className="flex items-center justify-center">
          <Suspense fallback={<div className="w-full text-center">Loading...</div>}>
            <SignupForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}