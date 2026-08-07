import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Category, Watch, CartItem } from './types';
import { ALL_WATCHES, MEN_WATCHES, WOMEN_WATCHES, getWatchById } from './data/watches';
import { useAppNavigation, Route } from './navigation/useAppNavigation';
import { ZoomTransitionProvider, useZoomTransition } from './components/transitions/ZoomTransition';
import { GenderGate } from './components/GenderGate';
import { Header } from './components/Header';
import { CategoryPage } from './components/CategoryPage';
import { WatchDetailPage } from './components/WatchDetailPage';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SearchModal } from './components/SearchModal';
import { TryOnModal } from './components/TryOnModal';
import { ConciergeModal } from './components/ConciergeModal';

function AppShell() {
  const { zoom } = useZoomTransition();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [tryOnWatch, setTryOnWatch] = useState<Watch | null>(null);
  const [conciergeWatch, setConciergeWatch] = useState<Watch | null>(null);
  const [conciergePhotoNumber, setConciergePhotoNumber] = useState<number | undefined>(undefined);

  /**
   * Back priority: the top-most overlay closes first, only then does the
   * route stack pop. Returns true when an overlay consumed the press.
   */
  const overlayStateRef = useRef({ cartOpen, wishlistOpen, searchOpen, tryOnWatch, conciergeWatch });
  overlayStateRef.current = { cartOpen, wishlistOpen, searchOpen, tryOnWatch, conciergeWatch };

  const closeTopOverlay = useCallback((): boolean => {
    const s = overlayStateRef.current;
    if (s.conciergeWatch) { setConciergeWatch(null); return true; }
    if (s.tryOnWatch) { setTryOnWatch(null); return true; }
    if (s.searchOpen) { setSearchOpen(false); return true; }
    if (s.wishlistOpen) { setWishlistOpen(false); return true; }
    if (s.cartOpen) { setCartOpen(false); return true; }
    return false;
  }, []);

  const nav = useAppNavigation({ interceptBack: closeTopOverlay });
  const route = nav.route;

  const allWatchesById = useMemo(() => {
    const map = new Map<string, Watch>();
    ALL_WATCHES.forEach(watch => map.set(watch.id, watch));
    return map;
  }, []);

  const wishlistedWatches = useMemo(
    () =>
      wishlistIds
        .map(id => allWatchesById.get(id) || getWatchById(id))
        .filter((watch): watch is Watch => Boolean(watch)),
    [wishlistIds, allWatchesById]
  );

  const activeCategory: Category = route.name === 'gate' ? 'all' : route.category;
  const activeWatches = activeCategory === 'all' ? ALL_WATCHES : activeCategory === 'men' ? MEN_WATCHES : WOMEN_WATCHES;
  const activeWatch =
    route.name === 'watch' ? allWatchesById.get(route.watchId) ?? getWatchById(route.watchId) ?? null : null;

  /* ---------------- navigation handlers ---------------- */

  // Gate -> collection, with the hero zoom flight.
  const handleGateChoice = useCallback(
    (category: Category, element: HTMLElement | null, src: string, fallbacks: string[]) => {
      zoom({
        element,
        imageSrc: src,
        imageFallbacks: fallbacks,
        radius: 24,
        intensity: 'hero',
        onArrive: () => nav.push({ name: 'category', category }),
      });
    },
    [nav, zoom]
  );

  // Grid -> product, with the soft zoom flight (element may be null).
  const handleSelectWatch = useCallback(
    (watch: Watch, element?: HTMLElement | null) => {
      const target: Route = {
        name: 'watch',
        category: watch.category,
        watchId: watch.id,
        watchName: watch.name,
      };
      closeTopOverlay();
      zoom({
        element: element ?? null,
        imageSrc: watch.images[0],
        imageFallbacks: watch.imageFallbacks.slice(0, 1),
        radius: 18,
        intensity: 'soft',
        onArrive: () => nav.push(target),
      });
    },
    [closeTopOverlay, nav, zoom]
  );

  const handleSwitchCategory = useCallback(
    (category: Category) => {
      if (route.name === 'gate') {
        nav.push({ name: 'category', category });
        return;
      }
      nav.replace({ name: 'category', category });
    },
    [nav, route.name]
  );

  /* ---------------- commerce handlers ---------------- */

  const handleToggleWishlist = useCallback((watch: Watch) => {
    setWishlistIds(prev =>
      prev.includes(watch.id) ? prev.filter(id => id !== watch.id) : [...prev, watch.id]
    );
  }, []);

  const handleAddToCart = useCallback(
    (watch: Watch, engravingText?: string, giftWrapping?: boolean, selectedPhotoNumber?: number) => {
      const photoNum = selectedPhotoNumber || 1;
      const itemId = `${watch.id}-photo-${photoNum}`;
      setCartItems(prev => {
        const existing = prev.find(item => item.id === itemId);
        if (existing) {
          return prev.map(item =>
            item.id === itemId
              ? { ...item, quantity: item.quantity + 1, engravingText, giftWrapping, selectedPhotoNumber: photoNum }
              : item
          );
        }
        return [...prev, { id: itemId, watch, quantity: 1, selectedPhotoNumber: photoNum, engravingText, giftWrapping }];
      });
      setCartOpen(true);
    },
    []
  );

  const handleUpdateQuantity = useCallback((itemId: string, quantity: number) => {
    setCartItems(prev => prev.map(item => (item.id === itemId ? { ...item, quantity } : item)));
  }, []);

  const handleRemoveCartItem = useCallback((itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const handleClearCart = useCallback(() => setCartItems([]), []);

  /* ---------------- render ---------------- */

  if (route.name === 'gate') {
    return <GenderGate onSelectCategory={handleGateChoice} />;
  }

  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#221F1B]">
      <Header
        currentCategory={activeCategory}
        onSelectCategory={handleSwitchCategory}
        onReturnToGate={nav.resetToGate}
        canGoBack={nav.canGoBack}
        backLabel={nav.backLabel}
        backLabelShort={nav.backLabelShort}
        onBack={nav.back}
        cartCount={cartItems.reduce((total, item) => total + item.quantity, 0)}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setCartOpen(true)}
        onOpenWishlist={() => setWishlistOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenConcierge={() => setConciergeWatch(activeWatches[0] || null)}
      />

      <main key={route.name === 'watch' ? route.watchId : route.category} className="page-enter">
        {route.name === 'watch' && activeWatch ? (
          <WatchDetailPage
            watch={activeWatch}
            onBack={nav.back}
            backLabel={nav.backLabel}
            backLabelShort={nav.backLabelShort}
            isWishlisted={wishlistIds.includes(activeWatch.id)}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onOpenTryOn={watch => setTryOnWatch(watch)}
            onOpenConcierge={(watch, photoNum) => { setConciergeWatch(watch); setConciergePhotoNumber(photoNum); }}
          />
        ) : (
          <CategoryPage
            category={activeCategory}
            watches={activeWatches}
            onSelectCategory={handleSwitchCategory}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onSelectWatch={handleSelectWatch}
            onAddToCart={handleAddToCart}
            onOpenConcierge={() => { setConciergeWatch(activeWatches[0] || null); setConciergePhotoNumber(1); }}
          />
        )}
      </main>

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onSelectCategory={handleSwitchCategory}
        onClearCart={handleClearCart}
      />

      <WishlistDrawer
        isOpen={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        wishlistedWatches={wishlistedWatches}
        onRemoveWishlist={handleToggleWishlist}
        onSelectWatch={watch => handleSelectWatch(watch, null)}
        onAddToCart={handleAddToCart}
        onSelectCategory={handleSwitchCategory}
      />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectWatch={watch => handleSelectWatch(watch, null)}
        currentCategory={activeCategory}
      />

      <TryOnModal
        isOpen={Boolean(tryOnWatch)}
        watch={tryOnWatch}
        onClose={() => setTryOnWatch(null)}
      />

      <ConciergeModal
        isOpen={Boolean(conciergeWatch)}
        watch={conciergeWatch}
        selectedPhotoNumber={conciergePhotoNumber}
        onClose={() => { setConciergeWatch(null); setConciergePhotoNumber(undefined); }}
      />
    </div>
  );
}

export function App() {
  return (
    <ZoomTransitionProvider>
      <AppShell />
    </ZoomTransitionProvider>
  );
}

export default App;
