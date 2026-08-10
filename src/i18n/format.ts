import { LOCALE_META } from './config';
import type { Locale } from './types';

/**
 * Currency word per locale. Morocco writes MAD as "dh"/"dhs" colloquially and
 * درهم in Arabic. `Intl.NumberFormat` with `style: 'currency'` would emit
 * "MAD 210" or "210,00 MAD", which is not how this boutique prices anything,
 * so the number is formatted by Intl and the word is appended by us.
 */
const CURRENCY_SUFFIX: Record<Locale, string> = {
  en: 'dhs',
  fr: 'dhs',
  ar: 'درهم',
};

const numberFormatters = new Map<string, Intl.NumberFormat>();

const numberFormatter = (tag: string, options?: Intl.NumberFormatOptions) => {
  const cacheKey = `${tag}|${JSON.stringify(options ?? {})}`;
  let formatter = numberFormatters.get(cacheKey);
  if (!formatter) {
    formatter = new Intl.NumberFormat(tag, options);
    numberFormatters.set(cacheKey, formatter);
  }
  return formatter;
};

export const formatNumber = (
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
): string => numberFormatter(LOCALE_META[locale].tag, options).format(value);

/**
 * The single price formatter for the whole application.
 *
 * Replaces `formatMad` in src/data/watches.ts for display purposes, the two
 * inline `{n} dh` expressions in CartDrawer and the `${price} dh`
 * concatenations in utils/whatsapp.ts — which, note, disagreed with the rest
 * of the site by dropping the `s`.
 */
export const formatPrice = (amount: number, locale: Locale): string =>
  `${formatNumber(amount, locale, { maximumFractionDigits: 0 })} ${CURRENCY_SUFFIX[locale]}`;

/** Localises the decimal separator of the wrist-size readout (13,5 cm in fr). */
export const formatDecimal = (value: number, locale: Locale, digits = 1): string =>
  formatNumber(value, locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });

const pluralRules = new Map<string, Intl.PluralRules>();

export const selectPluralCategory = (count: number, locale: Locale): Intl.LDMLPluralRule => {
  const tag = LOCALE_META[locale].tag;
  let rules = pluralRules.get(tag);
  if (!rules) {
    rules = new Intl.PluralRules(tag);
    pluralRules.set(tag, rules);
  }
  return rules.select(count);
};
