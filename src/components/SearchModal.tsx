import React, { useState, useMemo } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { Watch, Category } from '../types';
import { ALL_WATCHES } from '../data/watches';
import { ModalShell } from './ui/ModalShell';
import { Button, IconButton } from './ui/Button';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWatch: (watch: Watch, element?: HTMLElement | null) => void;
  currentCategory: Category;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectWatch,
  currentCategory
}) => {
  const [query, setQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');

  const filtered = useMemo(() => {
    if (!query && selectedBrand === 'All') return [];
    
    return ALL_WATCHES.filter((watch) => {
      if (selectedBrand !== 'All' && watch.brand !== selectedBrand) return false;
      if (!query) return true;

      const q = query.toLowerCase();
      return (
        watch.name.toLowerCase().includes(q) ||
        watch.brand.toLowerCase().includes(q) ||
        watch.referenceNumber.toLowerCase().includes(q) ||
        watch.subCollection.toLowerCase().includes(q) ||
        watch.shortDescription.toLowerCase().includes(q) ||
        watch.price.toString().includes(q)
      );
    }).slice(0, 10);
  }, [query, selectedBrand]);

  const brands = useMemo(() => {
    const set = new Set<string>();
    ALL_WATCHES.forEach(w => set.add(w.brand));
    return ['All', ...Array.from(set)];
  }, []);

  return (
    <ModalShell
      open={isOpen}
      onClose={onClose}
      title="Search Timepieces"
      subtitle="Filter by model, reference, or brand"
      icon={<Search className="w-5 h-5 text-[#B8934A]" />}
      maxWidthClass="max-w-2xl"
    >
      <div className="p-4 sm:p-6 space-y-4 font-sans">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8C8275] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            data-autofocus
            type="text"
            placeholder="Search by brand, reference code, or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white border border-[#E8E2D5] focus:border-[#B8934A] rounded-2xl pl-10 pr-10 py-3 text-sm text-[#221F1B] placeholder-[#8C8275] outline-none transition-all shadow-xs"
          />
          {query && (
            <IconButton
              label="Clear search"
              icon={<X className="w-4 h-4" />}
              onClick={() => setQuery('')}
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2"
            />
          )}
        </div>

        {/* Brand Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {brands.map((b) => (
            <Button
              key={b}
              variant={selectedBrand === b ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedBrand(b)}
            >
              {b}
            </Button>
          ))}
        </div>

        {/* Results */}
        <div className="space-y-2 pt-2">
          {filtered.length > 0 ? (
            filtered.map((watch) => (
              <div
                key={watch.id}
                onClick={(e) => {
                  onSelectWatch(watch, e.currentTarget);
                  onClose();
                }}
                className="surface-card p-3 flex items-center gap-4 hover:border-[#B8934A] cursor-pointer transition-all"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden img-frame photo-drop shrink-0">
                  <img
                    src={watch.images[0]}
                    alt={watch.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      if (watch.imageFallbacks[0] && e.currentTarget.src !== watch.imageFallbacks[0]) {
                        e.currentTarget.src = watch.imageFallbacks[0];
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-[10px] text-[#8C8275]">{watch.referenceNumber}</span>
                  <h4 className="font-serif-luxury text-base text-[#221F1B] truncate">{watch.name}</h4>
                  <p className="text-[11px] text-[#8C8275]">{watch.brand} · {watch.subCollection}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-serif-luxury text-sm font-semibold text-[#221F1B]">{watch.formattedPrice}</span>
                </div>
              </div>
            ))
          ) : query || selectedBrand !== 'All' ? (
            <div className="text-center py-8 text-xs text-[#8C8275]">
              No timepieces found matching your search criteria.
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-[#8C8275] flex flex-col items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#B8934A]" />
              <span>Type a keyword or select a brand above to explore timepieces.</span>
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
};
