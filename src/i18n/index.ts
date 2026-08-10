export { I18nProvider, useI18n, type I18nContextValue } from './I18nProvider';
export {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_META,
  MOROCCO_CITIES,
  QUERY_PARAM,
  SITE_URL,
  STORAGE_KEY,
  isLocale,
} from './config';
export { detectLocale, persistLocale, resolveLocale, primarySubtag } from './detect';
export { formatDecimal, formatNumber, formatPrice, selectPluralCategory } from './format';
export { plural } from './types';
export type {
  DataKind,
  Direction,
  Locale,
  PluralValue,
  TranslationKey,
  TranslationVars,
} from './types';
export type { Dictionary } from './locales/en';
