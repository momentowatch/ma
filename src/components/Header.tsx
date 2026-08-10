import React, { useEffect, useState } from 'react';
import { ShoppingBag, Heart, Search } from 'lucide-react';
import { Category } from '../types';
import { IconButton } from './ui/Button';

interface HeaderProps {
  currentCategory: Category;
  onSelectCategory: (category: Category) => void;
  onReturnToGate: () => void;
  canGoBack: boolean;
  backLabel: string;
  backLabelShort: string;
  onBack: () => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
  onOpenConcierge: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  onReturnToGate,
  canGoBack,
  backLabel,
  backLabelShort,
  onBack,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  onOpenConcierge,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={
        'sticky top-0 z-40 bg-[#FCFBF9]/80 backdrop-blur-xl border-b border-[#E5E1D8] transition-shadow duration-300 ' +
        (scrolled ? 'bar-shadow' : '')
      }
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 relative">
        {/* Left spacer for desktop absolute centering balance */}
        <div className="hidden sm:block w-8 shrink-0" />

        {/* Brand: Left on mobile, centered on laptop/desktop */}
        <button
          type="button"
          onClick={onReturnToGate}
          aria-label="MOMENTO home — choose a collection"
          className="group text-left sm:text-center px-1 py-1 rounded-xl transition-colors hover:bg-white/60 focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] mr-auto sm:mr-0 sm:absolute sm:left-1/2 sm:-translate-x-1/2 z-10"
        >
          <span className="font-serif-luxury text-base sm:text-2xl font-light tracking-[0.18em] sm:tracking-[0.25em] uppercase text-[#221F1B] group-hover:text-[#B8934A] transition-colors leading-tight block">
            MOMENTO
          </span>
          <span className="text-[8px] sm:text-[9px] block tracking-[0.24em] sm:tracking-[0.3em] uppercase text-[#8C8275] -mt-0.5 font-medium">
            Casa Watch
          </span>
        </button>

        {/* Right: actions, each one named */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 z-10">
          <IconButton
            label="Search"
            icon={<Search className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
            onClick={onOpenSearch}
            variant="ghost"
            size="sm"
          />
          <IconButton
            label="Wishlist"
            icon={<Heart className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
            onClick={onOpenWishlist}
            variant="ghost"
            size="sm"
            badge={wishlistCount}
            badgeTone="gold"
          />
          <IconButton
            label="Cart"
            icon={<ShoppingBag className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
            onClick={onOpenCart}
            variant="primary"
            size="sm"
            badge={cartCount}
          />
        </div>
      </div>

      {/* Second row: the gender switch, now unmistakable */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 pb-2 flex items-center justify-center">
        <div
          role="tablist"
          aria-label="Collection"
          className="inline-flex items-center bg-white/70 backdrop-blur-md p-1 rounded-full border border-[#E5E1D8] shadow-[var(--shadow-soft)]"
        >
          {(['all', 'men', 'women'] as Category[]).map(category => {
            const active = currentCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelectCategory(category)}
                className={
                  'min-h-[34px] px-3.5 sm:px-5 rounded-full text-[11px] font-semibold tracking-[0.16em] uppercase transition-all duration-300 focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] ' +
                  (active
                    ? 'bg-[#221F1B] text-white shadow-[var(--shadow-soft)]'
                    : 'text-[#8C8275] hover:text-[#221F1B]')
                }
              >
                {category === 'all' ? 'All Collection' : category === 'men' ? "Men's" : "Women's"}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
