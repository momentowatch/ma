import { DEFAULT_LOCALE, LOCALES, QUERY_PARAM, STORAGE_KEY, isLocale } from './config';
import type { Locale } from './types';

/** `fr-CA` -> `fr`, `ar_MA` -> `ar`, `EN` -> `en`. */
export const primarySubtag = (tag: string): string =>
  String(tag ?? '').toLowerCase().split('-')[0].split('_')[0];

/**
 * Pure resolver. Kept free of browser globals so it is unit-testable under
 * Vitest's `node` environment (this project's vitest config uses
 * `environment: 'node'`).
 */
export const resolveLocale = (input: {
  query?: string | null;
  stored?: string | null;
  deviceTags?: readonly string[];
}): Locale => {
  // 1. explicit URL override — shareable and testable
  const fromQuery = primarySubtag(input.query ?? '');
  if (isLocale(fromQuery)) return fromQuery;

  // 2. a choice the visitor made before always beats device detection
  if (isLocale(input.stored)) return input.stored;

  // 3. the device's ordered preference list
  for (const tag of input.deviceTags ?? []) {
    const candidate = primarySubtag(tag);
    if (isLocale(candidate)) return candidate;
  }

  // 4. English
  return DEFAULT_LOCALE;
};

/** Browser-facing wrapper. Safe to call during module evaluation. */
export const detectLocale = (): Locale => {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  let query: string | null = null;
  let stored: string | null = null;

  try {
    query = new URLSearchParams(window.location.search).get(QUERY_PARAM);
  } catch {
    /* malformed query string must never break boot */
  }
  try {
    stored = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    /* Safari private mode throws on localStorage access */
  }

  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  const deviceTags =
    nav?.languages && nav.languages.length > 0
      ? nav.languages
      : nav?.language
        ? [nav.language]
        : [];

  return resolveLocale({ query, stored, deviceTags });
};

export const persistLocale = (locale: Locale): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* storage unavailable: the choice simply will not survive a reload */
  }
};

export const SUPPORTED_LOCALES = LOCALES;
