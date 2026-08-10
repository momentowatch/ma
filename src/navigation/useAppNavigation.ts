import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Category } from '../types';
import type { TranslationKey } from '../i18n';

/** Every screen the shopper can stand on. */
export type Route =
  | { name: 'gate' }
  | { name: 'category'; category: Category }
  | { name: 'watch'; category: Category; watchId: string; watchName: string };

/**
 * NOTE ON TYPE SAFETY.
 *
 * This alias looks like it constrains the value to a known translation key,
 * but it does not: TranslationKey is a union of string literals, every literal
 * is assignable to string, so TypeScript reduces `TranslationKey | string` to
 * plain `string`. Before Round 6 that silently allowed eight nav.* keys that
 * no dictionary defined, and the shopper saw the raw key `nav.womenShort` in
 * the UI.
 *
 * The alias is kept because the value genuinely is "either a key or a proper
 * noun such as a watch name". The real guarantee now comes from
 * NAV_TITLE_KEYS below plus tests/nav-keys.test.ts.
 */
export type RouteTitleResult = TranslationKey | string;

/**
 * Every nav.* key routeTitle() and routeTitleShort() can return.
 *
 * The assertion beneath it is load-bearing: if any of these stops existing in
 * src/i18n/locales/*.ts, this file stops compiling and `npm run lint` fails.
 */
export const NAV_TITLE_KEYS = [
  'nav.gate',
  'nav.gateShort',
  'nav.all',
  'nav.allShort',
  'nav.men',
  'nav.menShort',
  'nav.women',
  'nav.womenShort',
  'nav.watchShort',
] as const;

const assertNavKeysResolve: readonly TranslationKey[] = NAV_TITLE_KEYS;
void assertNavKeysResolve;

export interface AppNavigation {
  /** Current screen. */
  route: Route;
  /** Full stack, oldest first. */
  stack: Route[];
  /** The screen Back will return to, if any. */
  previous: Route | null;
  canGoBack: boolean;
  /** Key or proper noun for the back target label. */
  backTargetKey: RouteTitleResult | null;
  /** Key for short label for narrow screens. */
  backTargetShortKey: RouteTitleResult | null;
  push: (route: Route) => void;
  replace: (route: Route) => void;
  back: () => void;
  resetToGate: () => void;
}

const ROOT: Route = { name: 'gate' };

export function routeKey(route: Route): string {
  if (route.name === 'gate') return 'gate';
  if (route.name === 'category') return 'category:' + route.category;
  return 'watch:' + route.category + ':' + route.watchId;
}

export function routeTitle(route: Route): RouteTitleResult {
  if (route.name === 'gate') return 'nav.gate';
  if (route.name === 'category') {
    if (route.category === 'all') return 'nav.all';
    return route.category === 'men' ? 'nav.men' : 'nav.women';
  }
  return route.watchName;
}

export function routeTitleShort(route: Route): RouteTitleResult {
  if (route.name === 'gate') return 'nav.gateShort';
  if (route.name === 'category') {
    if (route.category === 'all') return 'nav.allShort';
    return route.category === 'men' ? 'nav.menShort' : 'nav.womenShort';
  }
  return 'nav.watchShort';
}

interface Options {
  /**
   * Called before the stack is popped. Return true if something else
   * (an open drawer or modal) consumed the Back press.
   */
  interceptBack?: () => boolean;
}

export function useAppNavigation(options: Options = {}): AppNavigation {
  const [stack, setStack] = useState<Route[]>([ROOT]);

  // Always-fresh refs so the popstate listener never sees a stale closure.
  const stackRef = useRef(stack);
  stackRef.current = stack;
  const interceptRef = useRef(options.interceptBack);
  interceptRef.current = options.interceptBack;

  const back = useCallback(() => {
    if (interceptRef.current && interceptRef.current()) return; // an overlay ate it
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const push = useCallback((next: Route) => {
    setStack((prev) => {
      const top = prev[prev.length - 1];
      if (routeKey(top) === routeKey(next)) return prev;
      return [...prev, next];
    });
  }, []);

  const replace = useCallback((next: Route) => {
    setStack((prev) => [...prev.slice(0, -1), next]);
  }, []);

  const resetToGate = useCallback(() => {
    setStack([ROOT]);
  }, []);

  /**
   * Hardware / browser Back support without a router.
   */
  useEffect(() => {
    window.history.replaceState({ momento: 'root' }, '');
    window.history.pushState({ momento: 'trap' }, '');

    const onPop = () => {
      const hasOverlay = Boolean(interceptRef.current && interceptRef.current());
      const canPop = stackRef.current.length > 1;
      if (hasOverlay) {
        window.history.pushState({ momento: 'trap' }, '');
        return;
      }
      if (canPop) {
        setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
        window.history.pushState({ momento: 'trap' }, '');
      }
      // else: at the gate with nothing open -> allow the browser to leave.
    };

    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Scroll to the top on every route change.
  const route = stack[stack.length - 1];
  const routeK = routeKey(route);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [routeK]);

  const previous = stack.length > 1 ? stack[stack.length - 2] : null;

  return useMemo<AppNavigation>(
    () => ({
      route,
      stack,
      previous,
      canGoBack: stack.length > 1,
      backTargetKey: previous ? routeTitle(previous) : null,
      backTargetShortKey: previous ? routeTitleShort(previous) : null,
      push,
      replace,
      back,
      resetToGate,
    }),
    [route, stack, previous, push, replace, back, resetToGate],
  );
}
