import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, ShieldCheck, Sparkles, Gift, 
  MessageSquare, Share2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Watch } from '../types';
import { ModalShell } from './ui/ModalShell';
import { Button, IconButton } from './ui/Button';

interface WatchDetailModalProps {
  watch: Watch | null;
  onClose: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (watch: Watch) => void;
  onAddToCart: (watch: Watch, engravingText?: string, giftWrapping?: boolean) => void;
  onOpenTryOn: (watch: Watch) => void;
  onOpenConcierge: (watch: Watch) => void;
}

export const WatchDetailModal: React.FC<WatchDetailModalProps> = ({
  watch,
  onClose,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onOpenTryOn,
  onOpenConcierge
}) => {
  if (!watch) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'engraving'>('overview');
  const [engravingText, setEngravingText] = useState('');
  const [giftWrapping, setGiftWrapping] = useState(false);
  const [copied, setCopied] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const totalImages = watch.images.length;

  const scrollToImage = (index: number) => {
    if (!scrollContainerRef.current) return;
    isProgrammaticScroll.current = true;
    const container = scrollContainerRef.current;
    const targetLeft = index * container.clientWidth;
    container.scrollTo({ left: targetLeft, behavior: 'smooth' });
    setActiveImageIndex(index);
    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 400);
  };

  useEffect(() => {
    setActiveImageIndex(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [watch.id]);

  const handleSliderScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isProgrammaticScroll.current) return;
    const container = e.currentTarget;
    if (!container.clientWidth || totalImages <= 1) return;
    const newIndex = Math.round(container.scrollLeft / container.clientWidth);
    if (newIndex >= 0 && newIndex < totalImages && newIndex !== activeImageIndex) {
      setActiveImageIndex(newIndex);
    }
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (totalImages <= 1) return;
    const newIndex = activeImageIndex === 0 ? totalImages - 1 : activeImageIndex - 1;
    scrollToImage(newIndex);
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (totalImages <= 1) return;
    const newIndex = activeImageIndex === totalImages - 1 ? 0 : activeImageIndex + 1;
    scrollToImage(newIndex);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <ModalShell
      open={Boolean(watch)}
      onClose={onClose}
      title={watch.name}
      subtitle={watch.subCollection}
      icon={<Sparkles className="w-5 h-5 text-[#B8934A]" />}
      maxWidthClass="max-w-4xl"
    >
      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
        
        {/* Gallery Section */}
        <div>
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
                    alt={`${watch.name} - photo ${idx + 1}`}
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
                  onClick={() => scrollToImage(idx)}
                  aria-label={`Go to photo ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeImageIndex === idx ? 'w-6 bg-[#B8934A]' : 'w-2 bg-[#E8E2D5]'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Thumbnail Selector */}
          {watch.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {watch.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToImage(idx)}
                  className={`w-14 h-14 shrink-0 rounded-xl overflow-hidden border-2 transition-all bg-white cursor-pointer ${
                    activeImageIndex === idx ? 'border-[#B8934A] scale-105 shadow-xs' : 'border-[#E8E2D5] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={img} 
                    alt="" 
                    className="w-full h-full object-cover" 
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

          {/* Authenticity Guarantee Card */}
          <div className="mt-6 p-4 rounded-2xl bg-[#FAF8F3] border border-[#F0EAE0] flex items-center gap-3 text-xs">
            <ShieldCheck className="w-8 h-8 text-[#B8934A] shrink-0" />
            <div>
              <h4 className="font-semibold text-[#221F1B]">Official Casa Watch Guarantee</h4>
              <p className="text-[#736B60] text-[11px] mt-0.5">
                Includes presentation box, real store photos guarantee, and cash on delivery across Morocco.
              </p>
            </div>
          </div>
        </div>

        {/* Watch Specs & Customization Details */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#8C8275]">{watch.referenceNumber}</span>
              <IconButton
                label="Share timepiece link"
                icon={<Share2 className="w-4 h-4" />}
                onClick={handleShare}
                variant="ghost"
                size="sm"
              />
            </div>
            
            <h2 className="font-serif-luxury text-3xl font-light text-[#221F1B] mt-0.5 mb-1">
              {watch.name}
            </h2>
            <p className="text-xs text-[#B8934A] font-semibold uppercase tracking-wider mb-4">
              {watch.subtitle}
            </p>

            {/* Price */}
            <div className="text-3xl font-serif-luxury font-semibold text-[#221F1B] mb-6 pb-4 border-b border-[#E8E2D5]">
              {watch.formattedPrice}
            </div>

            {/* Navigation Tabs (Overview, Specs, Custom Engraving) */}
            <div className="flex items-center gap-2 border-b border-[#E8E2D5] pb-2 mb-4">
              {(['overview', 'specs', 'engraving'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`pb-1 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                    activeTab === tab ? 'border-[#B8934A] text-[#221F1B]' : 'border-transparent text-[#8C8275]'
                  }`}
                >
                  {tab === 'overview' ? 'Overview' : tab === 'specs' ? 'Specifications' : 'Engraving'}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-4 text-xs text-[#736B60] leading-relaxed">
                <p>{watch.fullDescription}</p>
                <div className="space-y-1.5 pt-2">
                  <h4 className="font-semibold uppercase tracking-wider text-[#221F1B]">Timepiece Highlights:</h4>
                  <ul className="space-y-1">
                    {watch.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#B8934A]" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-[#FAF8F3] rounded-xl border border-[#F0EAE0]">
                  <span className="text-[#8C8275] block text-[10px] uppercase">Case Material</span>
                  <span className="font-semibold text-[#221F1B]">{watch.specs.caseMaterial}</span>
                </div>
                <div className="p-2.5 bg-[#FAF8F3] rounded-xl border border-[#F0EAE0]">
                  <span className="text-[#8C8275] block text-[10px] uppercase">Diameter</span>
                  <span className="font-semibold text-[#221F1B]">{watch.specs.diameter}</span>
                </div>
                <div className="p-2.5 bg-[#FAF8F3] rounded-xl border border-[#F0EAE0]">
                  <span className="text-[#8C8275] block text-[10px] uppercase">Movement</span>
                  <span className="font-semibold text-[#221F1B]">{watch.specs.movement}</span>
                </div>
                <div className="p-2.5 bg-[#FAF8F3] rounded-xl border border-[#F0EAE0]">
                  <span className="text-[#8C8275] block text-[10px] uppercase">Power Reserve</span>
                  <span className="font-semibold text-[#221F1B]">{watch.specs.powerReserve}</span>
                </div>
                <div className="p-2.5 bg-[#FAF8F3] rounded-xl border border-[#F0EAE0]">
                  <span className="text-[#8C8275] block text-[10px] uppercase">Water Resistance</span>
                  <span className="font-semibold text-[#221F1B]">{watch.specs.waterResistance}</span>
                </div>
                <div className="p-2.5 bg-[#FAF8F3] rounded-xl border border-[#F0EAE0]">
                  <span className="text-[#8C8275] block text-[10px] uppercase">Strap / Bracelet</span>
                  <span className="font-semibold text-[#221F1B]">{watch.specs.strapMaterial}</span>
                </div>
              </div>
            )}

            {activeTab === 'engraving' && (
              <div className="space-y-4 text-xs">
                <p className="text-[#736B60]">
                  Our workshop offers custom laser engraving on the caseback (up to 20 characters).
                </p>
                <div>
                  <label className="font-semibold text-[#221F1B] block mb-1">Personal Caseback Text:</label>
                  <input
                    type="text"
                    maxLength={20}
                    placeholder="e.g., J.D. • 2026 • Eternally"
                    value={engravingText}
                    onChange={(e) => setEngravingText(e.target.value)}
                    className="w-full bg-white border border-[#E8E2D5] focus:border-[#B8934A] rounded-xl p-3 outline-none text-[#221F1B] font-serif-luxury text-sm"
                  />
                  <span className="text-[10px] text-[#8C8275] mt-1 block">
                    {20 - engravingText.length} characters remaining
                  </span>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={giftWrapping}
                    onChange={(e) => setGiftWrapping(e.target.checked)}
                    className="rounded border-[#D8CBB5] text-[#B8934A] focus:ring-[#B8934A]"
                  />
                  <div className="flex items-center gap-1.5 font-medium text-[#221F1B]">
                    <Gift className="w-4 h-4 text-[#B8934A]" />
                    <span>Include Signature Presentation Box & Gift Packaging</span>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Bottom CTAs */}
          <div className="pt-6 mt-6 border-t border-[#E8E2D5] space-y-3">
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={() => {
                  onAddToCart(watch, engravingText, giftWrapping);
                  onClose();
                }}
              >
                Acquire ({watch.formattedPrice})
              </Button>

              <IconButton
                label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                icon={<Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current text-[#B8934A]' : ''}`} />}
                variant="secondary"
                size="lg"
                onClick={() => onToggleWishlist(watch)}
              />
            </div>

            <Button
              variant="secondary"
              size="md"
              block
              icon={<MessageSquare className="w-4 h-4 text-[#B8934A]" />}
              onClick={() => {
                onClose();
                onOpenConcierge(watch);
              }}
            >
              Inquire with Watch Specialist
            </Button>
          </div>

        </div>

      </div>
    </ModalShell>
  );
};
