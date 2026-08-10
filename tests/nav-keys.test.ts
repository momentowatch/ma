import { describe, expect, it } from 'vitest';

import ar from '../src/i18n/locales/ar';
import en from '../src/i18n/locales/en';
import fr from '../src/i18n/locales/fr';
import {
  NAV_TITLE_KEYS,
  routeTitle,
  routeTitleShort,
} from '../src/navigation/useAppNavigation';
import type { Route } from '../src/navigation/useAppNavigation';

const DICTS = { en, fr, ar } as const;

const resolve = (dict: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((node, segment) => {
    if (node && typeof node === 'object' && segment in (node as Record<string, unknown>)) {
      return (node as Record<string, unknown>)[segment];
    }
    return undefined;
  }, dict);

// Every screen a shopper can stand on.
const ROUTES: Route[] = [
  { name: 'gate' },
  { name: 'category', category: 'all' },
  { name: 'category', category: 'men' },
  { name: 'category', category: 'women' },
  {
    name: 'watch',
    category: 'women',
    watchId: 'cw-car-07',
    watchName: 'Cartier Panthere Classic',
  },
];

describe('navigation title keys', () => {
  it('emits exactly the nav.* keys declared in NAV_TITLE_KEYS', () => {
    const emitted = new Set<string>();
    for (const route of ROUTES) {
      for (const value of [routeTitle(route), routeTitleShort(route)]) {
        if (value.startsWith('nav.')) emitted.add(value);
      }
    }
    expect([...emitted].sort()).toEqual([...NAV_TITLE_KEYS].sort());
  });

  it('resolves every nav.* key to a non-empty string in all three locales', () => {
    for (const [locale, dict] of Object.entries(DICTS)) {
      for (const key of NAV_TITLE_KEYS) {
        const value = resolve(dict, key);
        expect(typeof value, locale + ' -> ' + key + ' is missing').toBe('string');
        expect(
          (value as string).trim().length,
          locale + ' -> ' + key + ' is empty',
        ).toBeGreaterThan(0);
      }
    }
  });

  it('never lets a raw key stand in for a translation', () => {
    for (const dict of Object.values(DICTS)) {
      for (const key of NAV_TITLE_KEYS) {
        expect(resolve(dict, key)).not.toMatch(/^nav\./);
      }
    }
  });

  it('does not translate a watch name', () => {
    const watchRoute = ROUTES[ROUTES.length - 1];
    expect(routeTitle(watchRoute)).toBe('Cartier Panthere Classic');
  });
});
