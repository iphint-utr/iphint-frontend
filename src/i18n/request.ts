import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { isLocale } from '../lib/i18n'; // Double-check this relative path

export default getRequestConfig(async ({ locale }) => {
  // The 'locale' comes from the URL [locale] segment
  // We use your helper to validate it
  if (!locale || !isLocale(locale)) {
    notFound();
  }

  return {
    locale, 
    messages: (await import(`../messages/${locale}.json`)).default
  };
});