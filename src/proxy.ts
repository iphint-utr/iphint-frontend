import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './lib/i18n'; 
export default createMiddleware({
  locales: locales, 
  defaultLocale: defaultLocale, //
  localePrefix: 'always' // Forces the URL to reflect the current language
});

export const config = {
  // Use a broader matcher to capture all localized routes
  matcher: ['/', '/(ko|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};