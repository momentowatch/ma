import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Category } from '../types';

/** Every screen the shopper can stand on. */
export type Route =
  | { name: 'gate' }
  | { name: 'category'; category: Category }
  | { name: 'watch'; category: Category; watchId: string; watchName: string };

export interface AppNavigation {
  /** Current screen. */
  route: Route;
  /** Full stack, oldest first. */
  stack: Route[];
  /** The screen Back will return to, if any. */
  previous: Route | null;
  canGoBack: boolean;
  /** Ready-made label, e.g. "Back to Men's Collection". */
  backLabel: string;
  /** Short label for narrow screens, e.g. "Men's". */
  backLabelShort: string;
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

export function routeTitle(route: Route): string {
  if (route.name === 'gate') return 'Collection Selection';
  if (route.name === 'category') {
    if (route.category === 'all') return 'All Timepieces';
    return route.category === 'men' ? "Men's Collection" : "Women's Collection";
  }
  return route.watchName;
}

export function routeTitleShort(route: Route): string {
  if (route.name === 'gate') return 'Selection';
  if (route.name === 'category') {
    if (route.category === 'all') return 'All';
    return route.category === 'men' ? "Men's" : "Women's";
  }
  return 'Watch';
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
    setStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const push = useCallback((next: Route) => {
    setStack(prev => {
      const top = prev[prev.length - 1];
      if (routeKey(top) === routeKey(next)) return prev;
      return [...prev, next];
    });
  }, []);

  const replace = useCallback((next: Route) => {
    setStack(prev => [...prev.slice(0, -1), next]);
  }, []);

  const resetToGate = useCallback(() => {
    setStack([ROOT]);
  }, []);

  /**
   * Hardware / browser Back support without a router.
   * We keep one disposable "trap" entry in front of the real entry. When the
   * shopper presses Back the trap is consumed, we run our own back(), then we
   * push a fresh trap. Once we are on the gate with nothing to close we do not
   * re-arm, so a second Back genuinely leaves the site.
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
        setStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
        window.history.pushState({ momento: 'trap' }, '');
      }
      // else: at the gate with nothing open -> allow the browser to leave.
    };

    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Scroll to the top on every route change; it is a new page for the shopper.
  const route = stack[stack.length - 1];
  const routeK = routeKey(route);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [routeK]);

  const previous = stack.length > 1 ? stack[stack.length - 2] : null;

  return useMemo<AppNavigation>(() => ({
    route,
    stack,
    previous,
    canGoBack: stack.length > 1,
    backLabel: previous ? 'Back to ' + routeTitle(previous) : 'Back',
    backLabelShort: previous ? routeTitleShort(previous) : 'Back',
    push,
    replace,
    back,
    resetToGate,
  }), [route, stack, previous, push, replace, back, resetToGate]);
}
