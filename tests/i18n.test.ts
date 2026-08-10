import { describe, expect, it } from 'vitest';

import { ALL_WATCHES, SUB_COLLECTIONS_ALL } from '../src/data/watches';
import { MOROCCO_CITIES } from '../src/i18n/config';
import { primarySubtag, resolveLocale } from '../src/i18n/detect';
import ar from '../src/i18n/locales/ar';
import en from '../src/i18n/locales/en';
import fr from '../src/i18n/locales/fr';

const DICTS = { en, fr, ar } as const;
const PLURAL_CATEGORIES = ['zero', 'one', 'two', 'few', 'many', 'other'];
type Node = Record<string, unknown>;

const isPluralNode = (value: unknown): boolean =>
  !!value &&
  typeof value === 'object' &&
  PLURAL_CATEGORIES.some((category) => category in (value as Node));

const flatten = (node: Node, prefix = ''): string[] =>
  Object.entries(node).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !isPluralNode(value)) {
      return flatten(value as Node, path);
    }
    return [path];
  });

describe('dictionary integrity', () => {
  it('every locale exposes exactly the same key set', () => {
    const reference = flatten(en as unknown as Node).sort();
    expect(reference.length).toBeGreaterThan(200);
    for (const [name, dict] of Object.entries(DICTS)) {
      expect(flatten(dict as unknown as Node).sort(), `locale ${name}`).toEqual(reference);
    }
  });

  it('no translation is empty or leaks a placeholder', () => {
    const walk = (node: Node, path: string, locale: string) => {
      for (const [key, value] of Object.entries(node)) {
        const next = path ? `${path}.${key}` : key;
        if (typeof value === 'string') {
          expect(value.trim(), `${locale}:${next}`).not.toBe('');
          expect(value, `${locale}:${next}`).not.toMatch(/\bTODO\b|\bFIXME\b/);
        } else if (value && typeof value === 'object') {
          walk(value as Node, next, locale);
        }
      }
    };
    for (const [name, dict] of Object.entries(DICTS)) walk(dict as unknown as Node, '', name);
  });

  it('plural entries always provide "other", and Arabic provides all six categories', () => {
    const walk = (node: Node, path: string, locale: string) => {
      for (const [key, value] of Object.entries(node)) {
        const next = path ? `${path}.${key}` : key;
        if (isPluralNode(value)) {
          const record = value as Node;
          expect(record.other, `${locale}:${next}.other`).toBeTruthy();
          if (locale === 'ar') {
            for (const category of PLURAL_CATEGORIES) {
              expect(record[category], `ar:${next}.${category}`).toBeTruthy();
            }
          }
        } else if (value && typeof value === 'object') {
          walk(value as Node, next, locale);
        }
      }
    };
    for (const [name, dict] of Object.entries(DICTS)) walk(dict as unknown as Node, '', name);
  });

  it('interpolation placeholders match across locales', () => {
    const vars = (text: string) => (text.match(/\{(\w+)\}/g) ?? []).sort().join(',');
    const collect = (node: Node, path: string, into: Map<string, string>) => {
      for (const [key, value] of Object.entries(node)) {
        const next = path ? `${path}.${key}` : key;
        if (typeof value === 'string') into.set(next, vars(value));
        else if (value && typeof value === 'object') collect(value as Node, next, into);
      }
    };
    const reference = new Map<string, string>();
    collect(en as unknown as Node, '', reference);
    for (const [name, dict] of Object.entries(DICTS)) {
      if (name === 'en') continue;
      const actual = new Map<string, string>();
      collect(dict as unknown as Node, '', actual);
      for (const [key, expected] of reference) {
        expect(actual.get(key), `${name}:${key} placeholders`).toBe(expected);
      }
    }
  });
});

describe('catalogue translation coverage', () => {
  const collect = (pick: (watch: (typeof ALL_WATCHES)[number]) => string) =>
    Array.from(new Set(ALL_WATCHES.map(pick))).filter(Boolean);

  const CASES: Array<[keyof typeof en.data, string[]]> = [
    [
      'subCollection',
      Array.from(new Set([...SUB_COLLECTIONS_ALL, ...collect((w) => w.subCollection)])),
    ],
    ['caseMaterial', collect((w) => w.specs.caseMaterial)],
    ['strapMaterial', collect((w) => w.specs.strapMaterial)],
    ['movement', collect((w) => w.specs.movement)],
    ['batteryLife', collect((w) => w.specs.powerReserve)],
    ['waterResistance', collect((w) => w.specs.waterResistance)],
    ['glass', collect((w) => w.specs.glass)],
    ['buckle', collect((w) => w.specs.buckle)],
    ['city', [...MOROCCO_CITIES]],
  ];

  for (const [kind, values] of CASES) {
    it(`every ${kind} value is translated in all three locales`, () => {
      expect(values.length, `no ${kind} values were collected`).toBeGreaterThan(0);
      for (const [name, dict] of Object.entries(DICTS)) {
        const map = dict.data[kind] as Record<string, string>;
        for (const value of values) {
          expect(map[value], `${name}: data.${kind}["${value}"] is missing`).toBeTruthy();
        }
      }
    });
  }
});

describe('locale detection', () => {
  it('normalises tags to their primary subtag', () => {
    expect(primarySubtag('fr-CA')).toBe('fr');
    expect(primarySubtag('ar_MA')).toBe('ar');
    expect(primarySubtag('EN')).toBe('en');
  });

  it('honours the URL override above everything else', () => {
    expect(resolveLocale({ query: 'ar', stored: 'fr', deviceTags: ['en-US'] })).toBe('ar');
  });

  it('prefers an explicit stored choice over the device language', () => {
    expect(resolveLocale({ stored: 'fr', deviceTags: ['ar-MA'] })).toBe('fr');
  });

  it('falls back to the device language list in order', () => {
    expect(resolveLocale({ deviceTags: ['de-DE', 'ar-MA', 'en-GB'] })).toBe('ar');
    expect(resolveLocale({ deviceTags: ['fr-MA'] })).toBe('fr');
  });

  it('falls back to English for unsupported or missing input', () => {
    expect(resolveLocale({ deviceTags: ['ja-JP', 'de-DE'] })).toBe('en');
    expect(resolveLocale({})).toBe('en');
    expect(resolveLocale({ query: 'xx', stored: 'ar' })).toBe('ar');
  });
});

it('no component renders the raw formattedPrice field', async () => {
	const { readdirSync, readFileSync, statSync } = await import('node:fs')
	const { join } = await import('node:path')
	const walk = (dir: string): string[] =>
		readdirSync(dir).flatMap((entry) => {
			const full = join(dir, entry)
			return statSync(full).isDirectory() ? walk(full) : full.endsWith('.tsx') ? [full] : []
		})
	const offenders = walk('src').filter((f) => {
		const content = readFileSync(f, 'utf8')
		// We only want to fail if they use watch.formattedPrice
		// The type definition in types.ts and watches.ts itself is allowed
		if (f.endsWith('types.ts') || f.endsWith('watches.ts')) return false
		return content.includes('.formattedPrice') || content.includes('{formattedPrice}')
	})
	expect(offenders).toEqual([])
})
