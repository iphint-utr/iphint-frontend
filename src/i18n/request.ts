import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  const normalizedLocale = locale === 'ko' ? 'kr' : locale;
  type SupportedLocale = (typeof routing.locales)[number];

  const activeLocale: SupportedLocale =
    normalizedLocale && routing.locales.includes(normalizedLocale as SupportedLocale)
      ? (normalizedLocale as SupportedLocale)
      : routing.defaultLocale;

  return {
    locale: activeLocale,
    messages: (await import(`../messages/${activeLocale}.json`)).default
  };
});