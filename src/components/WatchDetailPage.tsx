import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Heart, ChevronLeft, ChevronRight, MessageSquare, ShoppingBag } from 'lucide-react';
import { Watch } from '../types';
import { BackButton } from './ui/BackButton';
import { Button, IconButton } from './ui/Button';
import { createSingleWatchWhatsAppMessage, formatWhatsAppLink } from '../utils/whatsapp';

interface WatchDetailPageProps {
  watch: Watch;
  onBack: () => void;
  backLabel: string;
  backLabelShort: string;
  isWishlisted: boolean;
  onToggleWishlist: (watch: Watch) => void;
  onAddToCart: (watch: Watch, engravingText?: string, giftWrapping?: boolean, selectedPhotoNumber?: number) => void;
  onOpenTryOn: (watch: Watch) => void;
  onOpenConcierge: (watch: Watch, photoNumber?: number) => void;
}

export const WatchDetailPage: React.FC<WatchDetailPageProps> = ({
  watch,
  onBack,
  backLabel,
  backLabelShort,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onOpenTryOn,
  onOpenConcierge,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const totalImages = watch.images.length;

  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const targetLeft = activeImageIndex * container.clientWidth;
      if (Math.abs(container.scrollLeft - targetLeft) > 5) {
        isProgrammaticScroll.current = true;
        container.scrollTo({ left: targetLeft, behavior: 'smooth' });
        const timer = setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 350);
        return () => clearTimeout(timer);
      }
    }
  }, [activeImageIndex]);

  const handleSliderScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isProgrammaticScroll.current) return;
    const container = e.currentTarget;
    if (!container.clientWidth) return;
    const newIndex = Math.round(container.scrollLeft / container.clientWidth);
    if (newIndex !== activeImageIndex && newIndex >= 0 && newIndex < totalImages) {
      setActiveImageIndex(newIndex);
    }
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex(prev => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex(prev => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 35) {
      if (deltaX < 0) {
        nextImage();
      } else {
        prevImage();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleAcquire = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onAddToCart(watch, undefined, undefined, activeImageIndex + 1);
  };

  const handleDirectWhatsApp = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const msg = createSingleWatchWhatsAppMessage(
      watch.name,
      watch.price,
      watch.referenceNumber,
      undefined,
      undefined,
      activeImageIndex + 1
    );
    window.open(formatWhatsAppLink(msg), '_blank');
  };

  // Keyboard navigation for ← / →
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (totalImages <= 1) return;
      if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalImages]);

  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#221F1B] pb-28 sm:pb-16 relative w-full overflow-x-hidden font-sans">
      {/* Top Navigation & Breadcrumb Bar */}
      <div
        className={
          'sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#E8E2D5] px-4 sm:px-6 py-2.5 transition-shadow duration-300 ' +
          (scrolled ? 'bar-shadow' : '')
        }
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <BackButton label={backLabel} shortLabel={backLabelShort} onClick={onBack} tone="bar" />
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#8C8275]">
            {watch.brand} · {watch.referenceNumber}
          </div>
        </div>
      </div>

      {/* Main Detail Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-2 sm:pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Main Image & Thumbnails */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="aspect-square img-frame photo-drop relative mb-3 overflow-hidden rounded-2xl group">
              {/* Slide-by-slide image container with touch swipe support */}
              <div
                ref={scrollContainerRef}
                onScroll={handleSliderScroll}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth touch-pan-x scrollbar-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {watch.images.map((img, idx) => (
                  <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative">
                    <img
                      src={img}
                      alt={`${watch.name} - ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const fallback = watch.imageFallbacks[idx] || watch.imageFallbacks[0];
                        if (fallback && e.currentTarget.src !== fallback) {
                          e.currentTarget.src = fallback;
                        }
                      }}
                      className="w-full h-full object-cover select-none"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>

              {totalImages > 1 && (
                <>
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden sm:block">
                    <IconButton
                      label="Previous photo"
                      icon={<ChevronLeft className="w-4 h-4 text-[#221F1B]" />}
                      onClick={prevImage}
                      variant="secondary"
                      size="sm"
                    />
                  </div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden sm:block">
                    <IconButton
                      label="Next photo"
                      icon={<ChevronRight className="w-4 h-4 text-[#221F1B]" />}
                      onClick={nextImage}
                      variant="secondary"
                      size="sm"
                    />
                  </div>
                  <div className="absolute bottom-3 right-3 z-10 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white tracking-wider pointer-events-none">
                    {activeImageIndex + 1} / {totalImages}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Slide Dots */}
            {totalImages > 1 && (
              <div className="flex justify-center items-center gap-1.5 mb-3 sm:hidden">
                {watch.images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`Go to photo ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeImageIndex === idx ? 'w-6 bg-[#B8934A]' : 'w-2 bg-[#E8E2D5]'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Thumbnail Selector */}
            {totalImages > 1 && (
              <div className="flex items-center justify-center gap-2.5 flex-wrap">
                {watch.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(idx);
                    }}
                    aria-label={'View photo ' + (idx + 1)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer touch-manipulation ${
                      activeImageIndex === idx
                        ? 'border-[#B8934A] ring-2 ring-[#B8934A]/30 edge-shadow-soft scale-105'
                        : 'border-[#E8E2D5] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover pointer-events-none"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        if (watch.imageFallbacks[idx] && e.currentTarget.src !== watch.imageFallbacks[idx]) {
                          e.currentTarget.src = watch.imageFallbacks[idx];
                        }
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right Column: Title, Price & Order Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-col justify-center space-y-6"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-[#8C8275]">{watch.referenceNumber}</span>
                <span className="text-[10px] uppercase font-semibold text-[#B8934A] tracking-wider">
                  {watch.subCollection}
                </span>
              </div>
              <h1 className="font-serif-luxury text-3xl sm:text-4xl font-light text-[#221F1B] leading-tight mb-2">
                {watch.name}
              </h1>

              {/* Price */}
              <div className="text-2xl sm:text-3xl font-serif-luxury font-normal text-[#221F1B]">
                {watch.formattedPrice}
              </div>

              {/* Selected Photo Indicator */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#F0EAE0]">
                <span className="text-xs uppercase font-semibold text-[#B8934A] bg-[#FAF5EB] px-3 py-1 rounded-full border border-[#E5DBCA]">
                  Watch Photo #{activeImageIndex + 1}
                </span>
                <span className="text-[11px] text-[#8C8275]">Selected variation sent in order</span>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                block
                icon={<ShoppingBag className="w-4 h-4" />}
                onClick={handleAcquire}
                className="touch-manipulation"
              >
                Acquire ({watch.formattedPrice})
              </Button>

              <Button
                variant={isWishlisted ? 'gold' : 'secondary'}
                size="lg"
                block
                icon={<Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-[#B8934A]' : ''}`} />}
                onClick={() => onToggleWishlist(watch)}
                className="touch-manipulation"
              >
                {isWishlisted ? 'In Wishes' : 'Add to Wishes'}
              </Button>
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-[#F0EAE0] space-y-2 text-xs text-[#736B60] leading-relaxed">
              <p>{watch.description || watch.shortDescription}</p>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
};

