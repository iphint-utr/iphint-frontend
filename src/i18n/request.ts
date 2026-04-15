import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { isLocale, defaultLocale } from '../lib/i18n'; 

export default getRequestConfig(async ({ locale }) => {
  // Use a fallback to prevent immediate 404 if locale is briefly undefined
  const targetLocale = locale && isLocale(locale) ? locale : defaultLocale;

  try {
    return {
      locale: targetLocale,
      messages: (await import(`../messages/${targetLocale}.json`)).default
    };
  } catch (error) {
    // If the file actually doesn't exist, then trigger notFound
    console.error(`Failed to load messages for locale: ${targetLocale}`, error);
    notFound();
  }
});