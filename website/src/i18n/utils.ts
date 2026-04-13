// i18n utility functions for locale detection and path generation

import { translations, type Locale, languages } from './translations';

/**
 * Get locale from URL path
 */
export function getLocaleFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split('/');
  if (lang in languages) {
    return lang as Locale;
  }
  return 'en';
}

/**
 * Get translations for a locale
 */
export function useTranslations(locale: Locale) {
  return translations[locale];
}

/**
 * Get localized path
 * - EN: /
 * - VI: /vi/
 * - JA: /ja/
 */
export function getLocalizedPath(path: string, locale: Locale): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const pathWithoutLocale = cleanPath.replace(/^(en|vi|ja)\//, '');

  if (locale === 'en') {
    return `/${pathWithoutLocale}`;
  }
  return `/${locale}/${pathWithoutLocale}`;
}

/**
 * Get alternate locales for language switcher
 */
export function getAlternateLocales(currentLocale: Locale): Locale[] {
  return (Object.keys(languages) as Locale[]).filter(l => l !== currentLocale);
}

/**
 * Get all locales
 */
export function getLocales(): Locale[] {
  return Object.keys(languages) as Locale[];
}
