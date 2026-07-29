import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale } from '../lib/languages';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});
