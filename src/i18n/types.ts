/**
 * Shared localisation types.
 *
 * Runtime surface is intentionally tiny: only the `plural` identity helper is
 * emitted. Everything else is erased at compile time.
 */
import type { Dictionary } from './locales/en';

export const LOCALES = ['en', 'fr', 'ar'] as const;

export type Locale = (typeof LOCALES)[number];

export type Direction = 'ltr' | 'rtl';

/**
 * A translated value that varies with a count.
 *
 * `other` is mandatory and is the fallback for every category the locale does
 * not declare. English and French use `one` + `other`. Arabic uses all six
 * CLDR categories, which is exactly why the naive `count === 1 ? a : b`
 * pattern currently in CartDrawer/WishlistDrawer has to go.
 */
export type PluralValue = {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
};

/**
 * Identity helper used in the dictionaries.
 *
 * Its only job is to widen the inferred type of a plural entry from an exact
 * object literal to `PluralValue`, so that `ar.ts` may legally declare the
 * extra `zero` / `two` / `few` / `many` categories while still being typed
 * against `Dictionary`.
 */
export const plural = (value: PluralValue): PluralValue => value;

/** Anything that is a translation value rather than a nested namespace. */
export type Leaf = string | PluralValue;

/** Recursive dot-path over the dictionary, e.g. `"cart.deliveryDetails"`. */
export type Path<T> = {
  [K in keyof T & string]: T[K] extends Leaf ? K : `${K}.${Path<T[K]>}`;
}[keyof T & string];

/**
 * Every valid translation key. Because this is derived from the English
 * dictionary, a typo in a `t()` call is a compile error, not a runtime blank.
 */
export type TranslationKey = Path<Dictionary>;

/** Interpolation variables. Numbers are formatted by the caller, not here. */
export type TranslationVars = Record<string, string | number>;

/** The catalogue namespaces that `tData()` can resolve. */
export type DataKind = keyof Dictionary['data'];
