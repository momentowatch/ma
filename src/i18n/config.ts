import type { Direction, Locale } from './types';
import { LOCALES } from './types';

export { LOCALES };
export type { Locale };

export const DEFAULT_LOCALE: Locale = 'en';

/**
 * localStorage key. MUST stay identical to the `KEY` constant in the inline
 * bootstrap script in index.html.
 */
export const STORAGE_KEY = 'momento.locale';

/** Query-string override, e.g. ?lang=ar. Used by the sitemap hreflang URLs. */
export const QUERY_PARAM = 'lang';

export type LocaleMeta = {
  /** BCP 47 tag written to <html lang> and handed to Intl. */
  tag: string;
  /** Writing direction written to <html dir>. */
  dir: Direction;
  /** Open Graph locale identifier. */
  ogLocale: string;
  /** The language's own name, in that language. Never translate these. */
  nativeName: string;
  /** Two-letter badge shown on the switcher trigger. */
  short: string;
};

/**
 * Locale tags are pinned deliberately.
 *
 * - `fr-MA`: French as used in Morocco.
 * - `ar-MA`: Arabic as used in Morocco. Critically, `ar-MA` renders Western
 *   Arabic numerals (210), whereas `ar-EG` would render Eastern Arabic
 *   numerals (٢١٠). Moroccan shoppers expect 210.
 */
export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: { tag: 'en', dir: 'ltr', ogLocale: 'en_US', nativeName: 'English', short: 'EN' },
  fr: { tag: 'fr-MA', dir: 'ltr', ogLocale: 'fr_FR', nativeName: 'Français', short: 'FR' },
  ar: { tag: 'ar-MA', dir: 'rtl', ogLocale: 'ar_MA', nativeName: 'العربية', short: 'AR' },
};

/** Public site URL, including base path, with trailing slash. */
export const SITE_URL: string = import.meta.env.VITE_SITE_URL ?? '/';

/**
 * Single source of truth for the delivery-city dropdowns.
 *
 * `value` is the canonical token that is submitted and forwarded to WhatsApp.
 * It MUST NOT be translated. Only the label the shopper sees is localised,
 * via `data.city` in each dictionary.
 */
export const MOROCCO_CITIES = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Tanger',
  'Agadir',
  'Fès',
  'Meknès',
  'Oujda',
  'Tétouan',
  'Other Morocco City',
] as const;

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
