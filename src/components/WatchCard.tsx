import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { Watch, ViewMode } from '../types';
import { Button, IconButton } from './ui/Button';
import { useI18n } from '../i18n';

interface WatchCardProps {
  watch: Watch;
  viewMode?: ViewMode;
  isWishlisted: boolean;
  onToggleWishlist: (watch: Watch) => void;
  onSelectWatch: (watch: Watch, element?: HTMLElement | null) => void;
  onAddToCart: (watch: Watch) => void;
  priority?: boolean;
}

export const WatchCard: React.FC<WatchCardProps> = ({
  watch,
  viewMode = 'grid',
  isWishlisted,
  onToggleWishlist,
  onSelectWatch,
  onAddToCart,
  priority = false,
}) => {
  const { t, tData, formatPrice, formatMeasure } = useI18n();
  const [imageIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const gallery = watch.images.length > 0 ? watch.images : (watch.coverImage ? [watch.coverImage] : []);
  const galleryFallbacks = watch.imageFallbacks.length > 0 ? watch.imageFallbacks : (watch.coverFallback ? [watch.coverFallback] : []);

  const currentSrc = gallery[imageIndex] || gallery[0];
  const currentFallback = galleryFallbacks[imageIndex] || galleryFallbacks[0];

  const handleCardClick = () => {
    onSelectWatch(watch, cardRef.current);
  };

  const translatedSubCollection = tData('subCollection', watch.subCollection);
  const translatedMaterial = tData('caseMaterial', watch.specs.caseMaterial);
  const translatedMovement = tData('movement', watch.specs.movement);
  const formattedDiameter = formatMeasure(watch.specs.diameter);
  const formattedPriceVal = formatPrice(watch.price);

  if (viewMode === 'editorial') {
    return (
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={handleCardClick}
        className="surface-card group p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center cursor-pointer relative"
      >
        {/* Left Column: Image */}
        <div className="md:col-span-4 aspect-square img-frame photo-drop relative overflow-hidden">
          <img
            src={currentSrc}
            alt={watch.name}
            loading={priority ? 'eager' : 'lazy'}
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            onError={(e) => {
              if (currentFallback && e.currentTarget.src !== currentFallback) {
                e.currentTarget.src = currentFallback;
              }
            }}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        {/* Right Column: Specs & Actions */}
        <div className="md:col-span-8 flex flex-col justify-between h-full space-y-4 font-sans">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-xs text-[#8C8275] force-ltr">{watch.referenceNumber}</span>
              <span className="text-[10px] uppercase tracking-widest text-[#B8934A] font-semibold">
                {translatedSubCollection}
              </span>
            </div>

            <h3 className="font-serif-luxury text-2xl font-light text-[#221F1B] group-hover:text-[#B8934A] transition-colors">
              {watch.name}
            </h3>
            <p className="text-xs text-[#736B60] mt-1 line-clamp-2">
              {t('copy.specLine', {
                subCollection: translatedSubCollection,
                caseMaterial: translatedMaterial,
                movement: translatedMovement,
              })}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px] text-[#736B60] bg-[#FAF8F3] p-2.5 rounded-xl border border-[#F0EAE0]">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-[#8C8275] block">
                {t('card.material')}
              </span>
              <span className="font-medium text-[#221F1B] truncate block">{translatedMaterial}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-[#8C8275] block">
                {t('card.diameter')}
              </span>
              <span className="font-medium text-[#221F1B] truncate block">{formattedDiameter}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-[#8C8275] block">
                {t('card.movement')}
              </span>
              <span className="font-medium text-[#221F1B] truncate block">{translatedMovement}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xl font-serif-luxury font-semibold text-[#221F1B] force-ltr inline-block">
              {formattedPriceVal}
            </div>

            <div className="flex items-center gap-2">
              <IconButton
                label={isWishlisted ? t('card.removeFromWishlist') : t('card.saveToWishlist')}
                icon={<Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-[#B8934A]' : ''}`} />}
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist(watch);
                }}
              />
              <Button
                variant="primary"
                size="sm"
                icon={<ShoppingBag className="w-3.5 h-3.5" />}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(watch);
                }}
              >
                {t('common.acquire')}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleCardClick}
      className="surface-card group p-2.5 sm:p-4 flex flex-col justify-between cursor-pointer relative font-sans h-full"
    >
      {/* Top Image Frame */}
      <div className="aspect-square img-frame photo-drop relative overflow-hidden mb-2 sm:mb-3">
        {/* Badges */}
        <div className="absolute top-1.5 start-1.5 sm:top-2 sm:start-2 z-10 flex flex-col gap-1">
          {watch.isNewRelease && (
            <span className="px-1.5 py-0.5 sm:px-2 rounded-full bg-[#B8934A] text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider shadow-xs">
              {t('common.isNew')}
            </span>
          )}
        </div>

        {/* Wishlist Icon Button */}
        <div className="absolute top-1.5 end-1.5 sm:top-2 sm:end-2 z-10">
          <IconButton
            label={isWishlisted ? t('card.removeFromWishlist') : t('card.saveToWishlist')}
            icon={<Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-current text-[#B8934A]' : ''}`} />}
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(watch);
            }}
          />
        </div>

        {/* Watch Image */}
        <img
          src={currentSrc}
          alt={watch.name}
          loading={priority ? 'eager' : 'lazy'}
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            if (currentFallback && e.currentTarget.src !== currentFallback) {
              e.currentTarget.src = currentFallback;
            }
          }}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Hover quick action overlay */}
        <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Eye className="w-3.5 h-3.5 text-[#B8934A]" />}
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            {t('common.quickView')}
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-2">
        <div>
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-[#8C8275] font-mono">
            <span className="truncate force-ltr">{watch.referenceNumber}</span>
            <span className="text-[#B8934A] font-sans font-semibold uppercase truncate ms-1">
              {translatedSubCollection}
            </span>
          </div>

          <h3 className="font-serif-luxury text-sm sm:text-lg font-light text-[#221F1B] group-hover:text-[#B8934A] transition-colors line-clamp-1 mt-0.5">
            {watch.name}
          </h3>
        </div>

        <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-[#F0EAE0]">
          <div className="text-sm sm:text-base font-serif-luxury font-semibold text-[#221F1B] force-ltr inline-block">
            {formattedPriceVal}
          </div>

          <Button
            variant="primary"
            size="sm"
            className="px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(watch);
            }}
          >
            {t('common.acquire')}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
