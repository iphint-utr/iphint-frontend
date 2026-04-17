import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // 1. Await the locale (it's now treated as a promise-like value in the plugin)
  const locale = await requestLocale;

  // 2. Validate and provide a fallback
  const activeLocale = locale || routing.defaultLocale;

  return {
    locale: activeLocale,
    messages: (await import(`../messages/${activeLocale}.json`)).default
  };
});