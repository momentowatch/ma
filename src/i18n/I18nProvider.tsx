import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { LOCALE_META, SITE_URL } from './config';
import { detectLocale, persistLocale } from './detect';
import { formatDecimal, formatNumber, formatPrice, selectPluralCategory } from './format';
import ar from './locales/ar';
import en, { type Dictionary } from './locales/en';
import fr from './locales/fr';
import type {
  DataKind,
  Direction,
  Leaf,
  Locale,
  PluralValue,
  TranslationKey,
  TranslationVars,
} from './types';

/**
 * All three dictionaries are imported statically and on purpose.
 *
 * Together they are a few kB gzipped. Lazy `import()` per locale would add a
 * loading state to a language switch and a flash of untranslated content on
 * first paint, for no measurable benefit at this size.
 */
const DICTIONARIES: Record<Locale, Dictionary> = { en, fr, ar };

const warned = new Set<string>();

const warnOnce = (message: string): void => {
  if (process.env.NODE_ENV === 'production') return;
  if (warned.has(message)) return;
  warned.add(message);
  // eslint-disable-next-line no-console
  console.warn(`[i18n] ${message}`);
};

const lookup = (dictionary: Dictionary, key: string): Leaf | undefined => {
  let cursor: unknown = dictionary;
  for (const segment of key.split('.')) {
    if (cursor === null || typeof cursor !== 'object') return undefined;
    cursor = (cursor as Record<string, unknown>)[segment];
  }
  return typeof cursor === 'string' || (cursor !== null && typeof cursor === 'object')
    ? (cursor as Leaf)
    : undefined;
};

const isPluralValue = (value: Leaf): value is PluralValue =>
  typeof value === 'object' && value !== null && 'other' in value;

/**
 * Single-brace interpolation: `"Back to {target}"`.
 *
 * Single braces are used rather than double so the templates cannot collide
 * with JS template literals or any moustache-style tooling in the pipeline.
 * An unresolved placeholder is left in place so it is visible in review
 * instead of silently vanishing.
 */
const interpolate = (template: string, vars?: TranslationVars): string => {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match,
  );
};

export type I18nContextValue = {
  locale: Locale;
  localeTag: string;
  dir: Direction;
  isRtl: boolean;
  setLocale: (locale: Locale) => void;
  /** Translate a key. Pass `count` in `vars` to select a plural form. */
  t: (key: TranslationKey, vars?: TranslationVars) => string;
  /** Translate a canonical English catalogue token (spec value, sub-collection, city). */
  tData: (kind: DataKind, value: string) => string;
  formatPrice: (amount: number) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDecimal: (value: number, digits?: number) => string;
  /** `"41 mm"` -> `"41 مم"`. Localises the unit inside a stored spec string. */
  formatMeasure: (raw: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(() => detectLocale());

  const setLocale = useCallback((next: Locale) => {
    setLocaleState((current) => {
      if (current === next) return current;
      persistLocale(next);
      return next;
    });
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const dictionary = DICTIONARIES[locale];
    const meta = LOCALE_META[locale];

    const t = (key: TranslationKey, vars?: TranslationVars): string => {
      let entry = lookup(dictionary, key);

      if (entry === undefined) {
        warnOnce(`missing key "${key}" in "${locale}", falling back to English`);
        entry = lookup(en, key);
      }
      if (entry === undefined) {
        warnOnce(`missing key "${key}" in every dictionary`);
        return key;
      }

      if (isPluralValue(entry)) {
        const count = Number(vars?.count ?? 0);
        const category = selectPluralCategory(count, locale);
        const template = entry[category] ?? entry.other;
        return interpolate(template, vars);
      }

      return interpolate(entry, vars);
    };

    const tData = (kind: DataKind, raw: string): string => {
      if (!raw) return raw;
      const group = dictionary.data[kind] as Record<string, string> | undefined;
      const translated = group?.[raw];
      if (translated) return translated;
      // Degrade to the canonical English token rather than throwing, but make
      // the gap loud in development so it is fixed the same day.
      warnOnce(`untranslated data value: data.${kind}["${raw}"] for locale "${locale}"`);
      return raw;
    };

    const formatMeasure = (raw: string): string => {
      if (!raw) return raw;
      const millimetres = t('units.mm');
      const centimetres = t('units.cm');
      return raw.replace(/\bmm\b/g, millimetres).replace(/\bcm\b/g, centimetres);
    };

    return {
      locale,
      localeTag: meta.tag,
      dir: meta.dir,
      isRtl: meta.dir === 'rtl',
      setLocale,
      t,
      tData,
      formatPrice: (amount: number) => formatPrice(amount, locale),
      formatNumber: (input: number, options?: Intl.NumberFormatOptions) =>
        formatNumber(input, locale, options),
      formatDecimal: (input: number, digits?: number) => formatDecimal(input, locale, digits),
      formatMeasure,
    };
  }, [locale, setLocale]);

  /**
   * The single owner of the live document head.
   *
   * Static tags in index.html serve social crawlers, which never execute
   * JavaScript. This effect serves the visitor: tab title, description,
   * lang, dir and og:locale all follow the active language. Do not duplicate
   * this logic anywhere else in the tree.
   */
  useEffect(() => {
    const meta = LOCALE_META[locale];
    const root = document.documentElement;

    root.lang = meta.tag;
    root.dir = meta.dir;
    root.setAttribute('data-locale', locale);

    const title = value.t('meta.title');
    const description = value.t('meta.description');
    document.title = title;

    const setMeta = (attribute: 'name' | 'property', key: string, content: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:locale', meta.ogLocale);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = locale === 'en' ? SITE_URL : `${SITE_URL}?lang=${locale}`;
  }, [locale, value]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside <I18nProvider>. Check src/main.tsx.');
  }
  return context;
};
