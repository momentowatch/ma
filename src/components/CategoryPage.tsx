import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  SlidersHorizontal, LayoutGrid, List, Search, RotateCcw, 
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Sparkles, ArrowRight, X 
} from 'lucide-react';
import { Watch, Category, ViewMode, FilterOptions } from '../types';
import { WatchCard } from './WatchCard';
import { SUB_COLLECTIONS_MEN, SUB_COLLECTIONS_WOMEN, SUB_COLLECTIONS_ALL, BRANDS_MEN, BRANDS_WOMEN, BRANDS_ALL, PRICE_BOUNDS } from '../data/watches';
import { Button, IconButton } from './ui/Button';
import { useI18n } from '../i18n';

interface CategoryPageProps {
  category: Category;
  watches: Watch[];
  onSelectCategory: (category: Category) => void;
  wishlistIds: string[];
  onToggleWishlist: (watch: Watch) => void;
  onSelectWatch: (watch: Watch, element?: HTMLElement | null) => void;
  onAddToCart: (watch: Watch) => void;
  onOpenConcierge: () => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  category,
  watches,
  wishlistIds,
  onToggleWishlist,
  onSelectWatch,
  onAddToCart,
  onOpenConcierge
}) => {
  const { t, tData, isRtl } = useI18n();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showCategorySection, setShowCategorySection] = useState(true);
  const [showAllProducts, setShowAllProducts] = useState(true);
  const productListRef = useRef<HTMLDivElement | null>(null);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setTimeout(() => {
      if (productListRef.current) {
        const yOffset = -70;
        const y = productListRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  };
  
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    brand: 'All',
    subCollection: 'All Collections',
    priceMin: PRICE_BOUNDS.min,
    priceMax: PRICE_BOUNDS.max,
    caseMaterial: 'All',
    movement: 'All',
    sortBy: 'featured'
  });

  useEffect(() => {
    setFilters(prev => ({ ...prev, brand: 'All' }));
    setShowCategorySection(true);
    setShowAllProducts(true);
  }, [category]);

  const subCollections = category === 'all' ? SUB_COLLECTIONS_ALL : category === 'men' ? SUB_COLLECTIONS_MEN : SUB_COLLECTIONS_WOMEN;
  const availableBrands = category === 'all' ? BRANDS_ALL : category === 'men' ? BRANDS_MEN : BRANDS_WOMEN;
  const brandSliderRef = useRef<HTMLDivElement>(null);

  const handleSelectBrand = (brandId: string) => {
    const isSelected = filters.brand === brandId && !showAllProducts;
    const nextBrand = isSelected ? 'All' : (brandId as any);
    setFilters(prev => ({ ...prev, brand: nextBrand }));
    setShowAllProducts(false);
    if (nextBrand !== 'All') {
      setShowCategorySection(false);
    } else {
      setShowCategorySection(true);
    }
  };

  const handleSeeAllProducts = () => {
    setFilters(prev => ({ ...prev, brand: 'All' }));
    setShowAllProducts(true);
    setShowCategorySection(false);
  };

  const slideLeft = () => {
    if (brandSliderRef.current) {
      const dir = isRtl ? 320 : -320;
      brandSliderRef.current.scrollBy({ left: dir, behavior: 'smooth' });
    }
  };

  const slideRight = () => {
    if (brandSliderRef.current) {
      const dir = isRtl ? -320 : 320;
      brandSliderRef.current.scrollBy({ left: dir, behavior: 'smooth' });
    }
  };

  const availableMaterials = useMemo(() => {
    const set = new Set<string>();
    watches.forEach(w => set.add(w.specs.caseMaterial.split(' ')[0]));
    return ['All', ...Array.from(set)];
  }, [watches]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search !== '') count++;
    if (filters.subCollection !== 'All Collections') count++;
    if (filters.caseMaterial !== 'All') count++;
    if (filters.priceMin > PRICE_BOUNDS.min || filters.priceMax < PRICE_BOUNDS.max) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  const filteredWatches = useMemo(() => {
    return watches
      .filter((w) => {
        if (filters.brand !== 'All' && w.brand !== filters.brand) return false;
        
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matchName = w.name.toLowerCase().includes(q);
          const matchBrand = w.brand?.toLowerCase().includes(q);
          const matchRef = w.referenceNumber.toLowerCase().includes(q);
          const matchSub = w.subCollection.toLowerCase().includes(q);
          const matchDesc = w.shortDescription.toLowerCase().includes(q);
          const matchFolder = w.sourceFolder.toLowerCase().includes(q);
          const matchPrice = w.price.toString() === q;
          if (!matchName && !matchBrand && !matchRef && !matchSub && !matchDesc && !matchFolder && !matchPrice) return false;
        }

        if (filters.subCollection !== 'All Collections' && w.subCollection !== filters.subCollection) return false;
        if (w.price < filters.priceMin || w.price > filters.priceMax) return false;
        if (filters.caseMaterial !== 'All' && !w.specs.caseMaterial.toLowerCase().includes(filters.caseMaterial.toLowerCase())) return false;

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-asc') return a.price - b.price;
        if (filters.sortBy === 'price-desc') return b.price - a.price;
        if (filters.sortBy === 'newest') return (b.isNewRelease ? 1 : 0) - (a.isNewRelease ? 1 : 0);
        return 0;
      });
  }, [watches, filters]);

  const resetFilters = () => {
    setFilters({
      search: '',
      brand: 'All',
      subCollection: 'All Collections',
      priceMin: PRICE_BOUNDS.min,
      priceMax: PRICE_BOUNDS.max,
      caseMaterial: 'All',
      movement: 'All',
      sortBy: 'featured'
    });
    setShowCategorySection(true);
    setShowAllProducts(false);
  };

  const BRAND_CUSTOM_IMAGES: Record<string, string> = {
    Boss: 'https://i.postimg.cc/tCzmsQx2/7.png',
    Hublot: 'https://i.postimg.cc/cL0CcY6d/Rolex-Oyster.png',
  };

  const brandChips = availableBrands.filter(b => b !== 'All').map(brand => {
    const brandWatches = watches.filter(w => w.brand === brand);
    const primaryWatch = brandWatches[0];
    let customImg = BRAND_CUSTOM_IMAGES[brand];
    if (brand === 'Cartier' && category === 'women') {
      customImg = 'https://noureddinelmobaraki-web.github.io/nl-audio-cdn/watch/Rolex%20Oyster/Cartier.webp';
    }
    if (brand === 'Casio' && category === 'women') {
      customImg = 'https://noureddinelmobaraki-web.github.io/nl-audio-cdn/watch/Rolex%20Oyster/casion.webp';
    }
    if (brand === 'Rolex' && category === 'women') {
      customImg = 'https://noureddinelmobaraki-web.github.io/nl-audio-cdn/watch/Rolex%20Oyster/Rolex%20f.webp';
    }
    return {
      id: brand,
      label: brand.toUpperCase(),
      count: brandWatches.length,
      image: customImg || primaryWatch?.coverImage || primaryWatch?.images[0] || '',
      fallbackImage: customImg || primaryWatch?.coverFallback || primaryWatch?.imageFallbacks[0] || ''
    };
  });

  const categoryTitle =
    category === 'all'
      ? t('cat.allTitle')
      : category === 'men'
        ? t('cat.menTitle')
        : t('cat.womenTitle');

  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#221F1B] pb-10 relative overflow-x-hidden w-full font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] end-[-20px] w-[300px] h-[300px] bg-[#F5E6D3] rounded-full blur-[100px] opacity-30" />
        <div className="absolute bottom-[10%] start-[-20px] w-[300px] h-[300px] bg-[#EAE7DC] rounded-full blur-[100px] opacity-25" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-1 sm:pt-2 relative z-10 w-full overflow-x-hidden">
        {/* Brand Showcase Slider */}
        <AnimatePresence>
          {showCategorySection && (
            <motion.section
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="pb-3 sm:pb-4 max-w-5xl mx-auto text-center relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3 px-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#B8934A] block text-start">
                    {categoryTitle}
                  </span>
                  <h2 className="font-serif-luxury text-xl sm:text-2xl text-[#221F1B] font-light text-start">
                    {t('cat.featuredBrands')}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {(filters.brand !== 'All' || showAllProducts) && (
                    <button
                      type="button"
                      onClick={() => setShowCategorySection(false)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#B8934A] bg-[#B8934A]/10 hover:bg-[#B8934A]/20 border border-[#B8934A]/20 rounded-full transition-all cursor-pointer"
                    >
                      <ChevronUp className="w-3 h-3 text-[#B8934A]" />
                      <span>{t('cat.hideCategories')}</span>
                    </button>
                  )}
                  <IconButton
                    label="Scroll collections left"
                    icon={<ChevronLeft className="w-4 h-4 rtl:rotate-180" />}
                    onClick={slideLeft}
                    variant="secondary"
                    size="sm"
                  />
                  <IconButton
                    label="Scroll collections right"
                    icon={<ChevronRight className="w-4 h-4 rtl:rotate-180" />}
                    onClick={slideRight}
                    variant="secondary"
                    size="sm"
                  />
                </div>
              </div>

              <div
                ref={brandSliderRef}
                className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth py-2 px-2 scrollbar-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* All Products Card */}
                <button
                  type="button"
                  onClick={handleSeeAllProducts}
                  className={`group shrink-0 w-[220px] sm:w-[250px] snap-center p-3 rounded-2xl bg-white border transition-all duration-300 text-center flex flex-col items-center cursor-pointer ${
                    filters.brand === 'All' && showAllProducts
                      ? 'border-[#B8934A] ring-2 ring-[#B8934A]/20 edge-shadow-lift'
                      : 'border-[#E8E2D5] edge-shadow-soft hover:edge-shadow-lift'
                  }`}
                >
                  <div className="w-full aspect-[4/3] rounded-xl overflow-hidden img-frame relative bg-[#F5F2EC]">
                    <img
                      src={
                        category === 'women'
                          ? 'https://i.postimg.cc/QC7gc5Cq/Gana-dinero-en-Internet-en-andigarcia-com-Got-watches.jpg'
                          : 'https://i.postimg.cc/fyd7YXy5/3b0ef66fdf01daf620925ea5967d14db.jpg'
                      }
                      alt={t('cat.allProducts')}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  <div className="pt-2.5 pb-1 space-y-1 w-full">
                    <span className={`font-serif-luxury text-base sm:text-lg font-light tracking-[0.12em] transition-colors block ${
                      filters.brand === 'All' && showAllProducts ? 'text-[#B8934A] font-normal' : 'text-[#221F1B] group-hover:text-[#B8934A]'
                    }`}>
                      {t('cat.allProducts')}
                    </span>

                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#B8934A] uppercase tracking-wider group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform">
                      <span>
                        {filters.brand === 'All' && showAllProducts ? t('cat.selected') : t('cat.seeAll')} ({watches.length})
                      </span>
                      <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                    </div>
                  </div>
                </button>

                {brandChips.map((b) => {
                  const isSelected = filters.brand === b.id && !showAllProducts;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSelectBrand(b.id)}
                      className={`group shrink-0 w-[220px] sm:w-[250px] snap-center p-3 rounded-2xl bg-white border transition-all duration-300 text-center flex flex-col items-center cursor-pointer ${
                        isSelected ? 'border-[#B8934A] ring-2 ring-[#B8934A]/20 edge-shadow-lift' : 'border-[#E8E2D5] edge-shadow-soft hover:edge-shadow-lift'
                      }`}
                    >
                      <div className="w-full aspect-[4/3] rounded-xl overflow-hidden img-frame relative bg-[#F5F2EC]">
                        <img
                          src={b.image}
                          alt={b.label}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            if (b.fallbackImage && e.currentTarget.src !== b.fallbackImage) {
                              e.currentTarget.src = b.fallbackImage;
                            }
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>

                      <div className="pt-2.5 pb-1 space-y-1 w-full">
                        <span className={`font-serif-luxury text-base sm:text-lg font-light tracking-[0.12em] transition-colors block ${
                          isSelected ? 'text-[#B8934A] font-normal' : 'text-[#221F1B] group-hover:text-[#B8934A]'
                        }`}>
                          {b.label}
                        </span>

                        <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#B8934A] uppercase tracking-wider group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform">
                          <span>{isSelected ? t('cat.selected') : t('cat.viewBrand')} ({b.count})</span>
                          <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {!showCategorySection && (filters.brand !== 'All' || showAllProducts) && (
          <div className="flex items-center justify-between flex-wrap gap-2.5 bg-white/95 backdrop-blur-sm border border-[#E8E2D5] rounded-xl px-3.5 py-2 mb-3 edge-shadow-soft max-w-5xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-[#8C8275] font-semibold">
                {t('cat.selectedPrefix')}
              </span>
              <span className="font-serif-luxury text-sm font-normal text-[#B8934A] uppercase tracking-wider">
                {filters.brand === 'All' ? `${t('cat.allProducts')} (${watches.length})` : filters.brand}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowCategorySection(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#B8934A] bg-[#B8934A]/10 hover:bg-[#B8934A]/20 border border-[#B8934A]/20 rounded-full transition-all cursor-pointer"
              >
                <ChevronDown className="w-3 h-3 text-[#B8934A]" />
                <span>{t('cat.showCategories')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilters(prev => ({ ...prev, brand: 'All' }));
                  setShowAllProducts(false);
                  setShowCategorySection(true);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#736B60] bg-[#F5F2EC] hover:bg-[#E8E2D5] border border-[#E8E2D5] rounded-full transition-all cursor-pointer"
              >
                <X className="w-3 h-3 text-[#736B60]" />
                <span>{t('cat.clear')}</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mb-3 font-sans">
          <div className="relative flex-1 max-w-sm sm:max-w-md">
            <Search className="w-3.5 h-3.5 text-[#8C8275] absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('cat.searchPlaceholder', { brand: filters.brand === 'All' ? '' : filters.brand })}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full bg-white/60 backdrop-blur-md border border-[#E5E1D8] focus:border-[#D4AF37] rounded-full ps-8 pe-8 py-1.5 text-[11px] text-[#221F1B] placeholder-[#8C8275] outline-none transition-all shadow-2xs"
            />
            {filters.search && (
              <IconButton
                label={t('cat.clearSearch')}
                icon={<X className="w-3 h-3" />}
                onClick={() => setFilters({ ...filters, search: '' })}
                variant="ghost"
                size="sm"
                className="absolute end-1 top-1/2 -translate-y-1/2"
              />
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer border ${
                showFilters || hasActiveFilters
                  ? 'bg-[#B8934A]/10 text-[#B8934A] border-[#B8934A]/30'
                  : 'bg-white/70 text-[#221F1B] border-[#E5E1D8] hover:border-[#B8934A]/40'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3 text-[#B8934A]" />
              <span>{t('cat.filters')}</span>
              {activeFilterCount > 0 && (
                <span className="ms-0.5 min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-bold bg-[#B8934A] text-white flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#736B60] bg-white/70 hover:bg-[#F5F2EC] border border-[#E5E1D8] rounded-full transition-all cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-[#B8934A]" />
                <span>{t('cat.reset')}</span>
              </button>
            )}

            <div className="relative">
              <select
                aria-label={t('sort.label')}
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="appearance-none bg-white/70 backdrop-blur-md border border-[#E5E1D8] hover:border-[#D4AF37] rounded-full ps-2.5 pe-6 py-1 text-[11px] font-medium text-[#221F1B] outline-none cursor-pointer transition-all shadow-2xs"
              >
                <option value="featured">{t('sort.featured')}</option>
                <option value="price-asc">{t('sort.priceAsc')}</option>
                <option value="price-desc">{t('sort.priceDesc')}</option>
                <option value="newest">{t('sort.newest')}</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#8C8275] absolute end-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="flex items-center bg-white/50 backdrop-blur-md p-0.5 rounded-full border border-[#E5E1D8]">
              <button
                type="button"
                aria-label={t('cat.gridView')}
                onClick={() => handleViewModeChange('grid')}
                className={`p-1 rounded-full transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-[#B8934A] text-white' : 'text-[#8C8275] hover:text-[#221F1B]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label={t('cat.listView')}
                onClick={() => handleViewModeChange('editorial')}
                className={`p-1 rounded-full transition-colors cursor-pointer ${
                  viewMode === 'editorial' ? 'bg-[#B8934A] text-white' : 'text-[#8C8275] hover:text-[#221F1B]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="surface-card edge-shadow p-5 grid grid-cols-1 sm:grid-cols-4 gap-5 text-xs font-sans">
                <div>
                  <label className="font-semibold text-[#221F1B] uppercase tracking-wider block mb-2">
                    {t('cat.caseMaterial')}
                  </label>
                  <select
                    value={filters.caseMaterial}
                    onChange={(e) => setFilters({ ...filters, caseMaterial: e.target.value })}
                    className="w-full bg-white/60 border border-[#E5E1D8] focus:border-[#D4AF37] rounded-xl p-2.5 outline-none text-[#221F1B]"
                  >
                    {availableMaterials.map((mat) => (
                      <option key={mat} value={mat}>
                        {mat === 'All' ? t('cat.allMaterials') : tData('caseMaterial', mat)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#221F1B] uppercase tracking-wider block mb-2">
                    {t('cat.collectionCategory')}
                  </label>
                  <select
                    value={filters.subCollection}
                    onChange={(e) => setFilters({ ...filters, subCollection: e.target.value as any })}
                    className="w-full bg-white/60 border border-[#E5E1D8] focus:border-[#D4AF37] rounded-xl p-2.5 outline-none text-[#221F1B]"
                  >
                    {subCollections.map((sc) => (
                      <option key={sc} value={sc}>
                        {sc === 'All Collections' ? t('cat.allCollections') : tData('subCollection', sc)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1 sm:col-span-2 flex flex-col justify-between">
                  <label className="font-semibold text-[#221F1B] uppercase tracking-wider block mb-2">
                    {t('cat.priceRange', { min: PRICE_BOUNDS.min, max: PRICE_BOUNDS.max })}
                  </label>
                  <div className="flex items-center gap-3 flex-1 mt-1">
                    <div className="flex flex-col w-full">
                      <span className="text-[10px] text-[#8C8275] mb-1">
                        {t('cat.maxPrice', { price: filters.priceMax })}
                      </span>
                      <input 
                        type="range" 
                        min={PRICE_BOUNDS.min} 
                        max={PRICE_BOUNDS.max} 
                        step={5} 
                        value={filters.priceMax}
                        onChange={(e) => setFilters({...filters, priceMax: Number(e.target.value)})}
                        className="w-full accent-[#B8934A]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<RotateCcw className="w-3.5 h-3.5 text-[#B8934A]" />}
                      onClick={resetFilters}
                    >
                      {t('cat.reset')}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
            <span className="text-[#8C8275] font-medium">{t('cat.activeFilters')}</span>
            {filters.subCollection !== 'All Collections' && (
              <span className="px-3 py-1 bg-[#FAF5EB] text-[#B8934A] border border-[#E5DBCA] rounded-full font-medium">
                {tData('subCollection', filters.subCollection)}
              </span>
            )}
            {filters.caseMaterial !== 'All' && (
              <span className="px-3 py-1 bg-[#FAF5EB] text-[#B8934A] border border-[#E5DBCA] rounded-full font-medium">
                {t('cat.caseMaterial')}: {tData('caseMaterial', filters.caseMaterial)}
              </span>
            )}
            {filters.priceMax < PRICE_BOUNDS.max && (
              <span className="px-3 py-1 bg-[#FAF5EB] text-[#B8934A] border border-[#E5DBCA] rounded-full font-medium">
                {t('cat.upTo', { price: filters.priceMax })}
              </span>
            )}
            {filters.search && (
              <span className="px-3 py-1 bg-[#FAF5EB] text-[#B8934A] border border-[#E5DBCA] rounded-full font-medium">
                "{filters.search}"
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              {t('cat.clear')}
            </Button>
          </div>
        )}

        <div ref={productListRef} className="flex items-center justify-between mb-4 text-xs text-[#8C8275]">
          <span>
            {t('cat.showingCount', {
              count: filteredWatches.length,
              brand: filters.brand === 'All' ? t('cat.timepiecesAll') : t('cat.timepiecesBrand', { brand: filters.brand }),
            })}
          </span>
        </div>

        {filteredWatches.length > 0 ? (
          <div className={`grid ${
            viewMode === 'grid' 
              ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6' 
              : 'grid-cols-1 gap-4 sm:gap-6'
          }`}>
            {filteredWatches.map((watch, i) => (
              <WatchCard
                key={watch.id}
                watch={watch}
                viewMode={viewMode}
                isWishlisted={wishlistIds.includes(watch.id)}
                onToggleWishlist={onToggleWishlist}
                onSelectWatch={onSelectWatch}
                onAddToCart={onAddToCart}
                priority={i < 4}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 surface-card edge-shadow max-w-md mx-auto my-8">
            <Search className="w-10 h-10 text-[#D8CBB5] mx-auto mb-3" />
            <h3 className="font-serif-luxury text-xl text-[#221F1B]">{t('cat.noMatchTitle')}</h3>
            <p className="text-xs text-[#736B60] mt-1 mb-5">
              {t('cat.noMatchBody')}
            </p>
            <Button variant="primary" size="md" onClick={resetFilters}>
              {t('cat.reset')}
            </Button>
          </div>
        )}

        <section className="mt-16 bg-white p-8 sm:p-12 rounded-3xl border border-[#E8E2D5] text-center relative overflow-hidden edge-shadow-soft">
          <div className="max-w-xl mx-auto relative z-10">
            <Sparkles className="w-5 h-5 text-[#B8934A] mx-auto mb-3" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#B8934A] font-bold block mb-1">
              {t('cat.boutiqueSub')}
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-light text-[#221F1B]">
              {t('cat.storyTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-[#736B60] mt-3 leading-relaxed">
              {t('cat.storyCraftsmanship')}
            </p>
            <div className="mt-6 flex justify-center">
              <Button
                variant="gold"
                size="lg"
                iconRight={<ArrowRight className="w-4 h-4 rtl:rotate-180" />}
                onClick={onOpenConcierge}
              >
                {t('cat.scheduleConsultation')}
              </Button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
