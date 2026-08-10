import React from 'react';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { Watch, Category } from '../types';
import { ModalShell } from './ui/ModalShell';
import { Button, IconButton } from './ui/Button';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistedWatches: Watch[];
  onRemoveWishlist: (watch: Watch) => void;
  onSelectWatch: (watch: Watch) => void;
  onAddToCart: (watch: Watch) => void;
  onSelectCategory: (category: Category) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistedWatches,
  onRemoveWishlist,
  onSelectWatch,
  onAddToCart,
  onSelectCategory,
}) => {
  const itemCountLabel = `${wishlistedWatches.length} piece${wishlistedWatches.length === 1 ? '' : 's'}`;

  return (
    <ModalShell
      open={isOpen}
      onClose={onClose}
      layout="drawer"
      title="Saved Wishlist"
      subtitle={itemCountLabel}
      icon={<Heart className="w-5 h-5 text-[#B8934A]" />}
    >
      <div className="p-4 sm:p-6 font-sans">
        {wishlistedWatches.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Heart className="w-12 h-12 text-[#D8CBB5] mx-auto" />
            <div>
              <h3 className="font-serif-luxury text-xl text-[#221F1B]">Your wishlist is empty</h3>
              <p className="text-xs text-[#736B60] mt-1">Save your favorite timepieces while exploring.</p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button variant="primary" size="sm" onClick={() => { onClose(); onSelectCategory('men'); }}>
                Men's Collection
              </Button>
              <Button variant="secondary" size="sm" onClick={() => { onClose(); onSelectCategory('women'); }}>
                Women's Collection
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {wishlistedWatches.map((watch) => (
              <div
                key={watch.id}
                onClick={() => {
                  onSelectWatch(watch);
                  onClose();
                }}
                className="surface-card p-3 flex gap-4 items-center cursor-pointer hover:border-[#B8934A] transition-all"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden img-frame photo-drop shrink-0">
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

                <div className="flex-1 min-w-0 space-y-0.5">
                  <span className="font-mono text-[10px] text-[#8C8275]">{watch.referenceNumber}</span>
                  <h4 className="font-serif-luxury text-base text-[#221F1B] truncate">{watch.name}</h4>
                  <div className="text-sm font-serif-luxury font-semibold text-[#221F1B]">
                    {watch.formattedPrice}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    label="Remove from wishlist"
                    icon={<Trash2 className="w-4 h-4 text-[#A33A2B]" />}
                    onClick={() => onRemoveWishlist(watch)}
                    variant="ghost"
                    size="sm"
                  />

                  <Button
                    variant="primary"
                    size="sm"
                    icon={<ShoppingBag className="w-3.5 h-3.5" />}
                    onClick={() => {
                      onAddToCart(watch);
                      onClose();
                    }}
                  >
                    Acquire
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalShell>
  );
};
