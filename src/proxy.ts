import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './lib/i18n';

export default createMiddleware({
  // Use the locales you already defined in your lib
  locales: locales,
  defaultLocale: defaultLocale,
  // This ensures that if the user hits "/", they get redirected to "/en"
  localePrefix: 'always' 
});

export const config = {
  // Use your existing matcher, it looks solid for skipping assets
  matcher: [
    "/((?!_next|favicon.ico|r3.jpeg|logo.svg|i1.svg|logo2.svg|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};