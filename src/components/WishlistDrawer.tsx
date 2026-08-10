import React from 'react';
import { Heart, X, ShoppingBag } from 'lucide-react';
import { Watch, Category } from '../types';
import { DrawerShell } from './ui/ModalShell';
import { Button, IconButton } from './ui/Button';
import { useI18n } from '../i18n';

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
  const { t, tData, formatPrice } = useI18n();

  return (
    <DrawerShell
      open={isOpen}
      onClose={onClose}
      title={t('wish.title')}
      subtitle={t('wish.piecesCount', { count: wishlistedWatches.length })}
      icon={<Heart className="w-5 h-5 text-[#B8934A]" />}
    >
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-sans">
        {wishlistedWatches.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 pb-20">
            <div className="w-16 h-16 rounded-full bg-[#F5F2EC] flex items-center justify-center mb-2">
              <Heart className="w-6 h-6 text-[#D8CBB5]" />
            </div>
            <h3 className="font-serif-luxury text-xl text-[#221F1B]">{t('wish.emptyTitle')}</h3>
            <p className="text-sm text-[#8C8275] max-w-[200px]">{t('wish.emptyBody')}</p>
            <div className="pt-4 grid grid-cols-2 gap-3 w-full">
              <Button variant="secondary" onClick={() => { onSelectCategory('men'); onClose(); }}>
                {t('cart.menButton')}
              </Button>
              <Button variant="secondary" onClick={() => { onSelectCategory('women'); onClose(); }}>
                {t('cart.womenButton')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-6">
            {wishlistedWatches.map((watch) => (
              <div
                key={watch.id}
                className="surface-card p-3 relative flex gap-3 sm:gap-4 cursor-pointer hover:border-[#B8934A] transition-colors"
                onClick={() => {
                  onSelectWatch(watch);
                  onClose();
                }}
              >
                <div className="w-20 sm:w-24 aspect-[3/4] rounded-lg overflow-hidden img-frame photo-drop shrink-0 bg-[#F5F2EC]">
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

                <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                  <div className="pe-6">
                    <span className="font-mono text-[9px] text-[#8C8275] force-ltr">{watch.referenceNumber}</span>
                    <h4 className="font-serif-luxury text-sm sm:text-base text-[#221F1B] truncate mt-0.5">{watch.name}</h4>
                    <p className="text-[10px] text-[#8C8275] mt-0.5 truncate">{watch.brand} · {tData('subCollection', watch.subCollection)}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="font-serif-luxury text-sm font-semibold text-[#221F1B] force-ltr">
                      {formatPrice(watch.price)}
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="px-2.5 py-1 text-[10px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(watch);
                      }}
                    >
                      <ShoppingBag className="w-3 h-3 sm:me-1.5" />
                      <span className="hidden sm:inline">{t('common.acquire')}</span>
                    </Button>
                  </div>
                </div>

                <div className="absolute top-2 end-2">
                  <IconButton
                    label={t('cart.removeItem')}
                    icon={<X className="w-3.5 h-3.5" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveWishlist(watch);
                    }}
                    variant="ghost"
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DrawerShell>
  );
};
