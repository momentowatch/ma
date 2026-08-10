import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check, Ruler, PenTool, Shield, RotateCcw, Box, ArrowRight, Play, Eye, MessageSquare, Plus, Minus, CreditCard, Sparkles } from 'lucide-react';
import { Watch } from '../types';
import { getListingsForProduct } from '../data/watches';
import { Button } from './ui/Button';
import { useI18n, type TranslationKey } from '../i18n';
import { createSingleWatchWhatsAppMessage, formatWhatsAppLink } from '../utils/whatsapp';

// A minimal video block for automatic/chronograph watches
const MovementVideo: React.FC<{ type: 'chrono' | 'auto'; isRtl: boolean }> = ({ type, isRtl }) => {
  const { t } = useI18n();
  const videoSrc = type === 'chrono'
    ? 'https://noureddinelmobaraki-web.github.io/nl-audio-cdn/watch/Rolex%20Oyster/crono.mp4'
    : 'https://noureddinelmobaraki-web.github.io/nl-audio-cdn/watch/Rolex%20Oyster/autumatic.mp4';
  const label = type === 'chrono' ? 'Chronograph' : 'Automatic';

  return (
    <div className="surface-card p-2 sm:p-3 mt-4 flex items-center gap-3">
      <div className="w-16 sm:w-20 aspect-video bg-black rounded-lg overflow-hidden relative shrink-0">
        <video
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="w-4 h-4 text-white/70" fill="currentColor" />
        </div>
      </div>
      <div className="flex-1">
        <span className="text-[9px] uppercase tracking-wider text-[#B8934A] font-semibold block">
          {'Movement'}
        </span>
        <p className="text-xs text-[#221F1B] mt-0.5 line-clamp-2">
          {'See it in action'}
        </p>
      </div>
    </div>
  );
};

interface WatchDetailPageProps {
  watch: Watch;
  onBack: () => void;
  backLabel: string;
  backLabelShort: string;
  isWishlisted: boolean;
  onToggleWishlist: (watch: Watch) => void;
  onAddToCart: (watch: Watch, engravingText?: string, giftWrapping?: boolean, selectedPhotoNumber?: number) => void;
  onOpenTryOn: (watch: Watch) => void;
  onOpenConcierge: (watch: Watch, photoNumber: number) => void;
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
  const { t, tData, formatPrice, formatMeasure, isRtl } = useI18n();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [wantsEngraving, setWantsEngraving] = useState(false);
  const [engravingText, setEngravingText] = useState('');
  const [wantsGiftWrap, setWantsGiftWrap] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const trackRef = useRef<HTMLDivElement>(null);
  
  // Which collection grid does this specific listing belong to?
  const parentGrid = watch.category;
  
  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index));
  };

  const handleImageError = (index: number, e: React.SyntheticEvent<HTMLImageElement>) => {
    if (watch.imageFallbacks[index] && e.currentTarget.src !== watch.imageFallbacks[index]) {
      e.currentTarget.src = watch.imageFallbacks[index];
    }
  };

  const scrollToImage = (index: number) => {
    setActivePhotoIndex(index);
    if (trackRef.current) {
      const slides = Array.from(trackRef.current.children) as HTMLElement[];
      const target = slides[index];
      if (target) {
        trackRef.current.scrollTo({
          left: target.offsetLeft,
          behavior: 'smooth',
        });
      }
    }
  };

  const handleScroll = () => {
    if (trackRef.current) {
      const track = trackRef.current;
      const scrollLeft = track.scrollLeft;
      const width = track.clientWidth;
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex !== activePhotoIndex) {
        setActivePhotoIndex(newIndex);
      }
    }
  };

  const handleDirectWhatsApp = () => {
    const i18n = { t, tData, formatPrice };
    const msg = createSingleWatchWhatsAppMessage(
      i18n,
      watch.name,
      watch.price * quantity,
      watch.referenceNumber,
      wantsEngraving ? engravingText : undefined,
      wantsGiftWrap,
      activePhotoIndex + 1
    );
    window.open(formatWhatsAppLink(msg), '_blank');
  };

  const hasVideo = watch.specs.movement === 'chrono' || watch.specs.movement === 'auto';
  
  const allListings = getListingsForProduct(watch.productId);
  const hasMultipleGenders = allListings.length > 1;

  const translatedSubCollection = tData('subCollection', watch.subCollection);
  const translatedMaterial = tData('caseMaterial', watch.specs.caseMaterial);
  const translatedMovement = tData('movement', watch.specs.movement);
  const translatedStrap = tData('strapMaterial', watch.specs.strapMaterial);
  const translatedGlass = tData('glass', watch.specs.glass);
  const translatedBuckle = tData('buckle', watch.specs.buckle);
  const formattedDiameter = formatMeasure(watch.specs.diameter);
  const formattedThickness = formatMeasure(watch.specs.thickness);
  const formattedPriceVal = formatPrice(watch.price);

  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#221F1B] pb-24 font-sans w-full max-w-full overflow-x-hidden">
      {/* 
        Header bar 
      */}
      <div className="sticky top-14 sm:top-16 z-30 bg-[#FCFBF9]/90 backdrop-blur-md border-b border-[#E8E2D5] py-2 px-2 sm:px-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="group flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-black/5 transition-colors text-xs font-semibold uppercase tracking-wider text-[#736B60] hover:text-[#221F1B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8934A]"
        >
          <ArrowRight className="w-4 h-4 text-[#B8934A] group-hover:-translate-x-1 transition-transform rotate-180 rtl:rotate-0 rtl:group-hover:translate-x-1" />
          <span className="hidden sm:inline">{backLabel}</span>
          <span className="sm:hidden">{backLabelShort}</span>
        </button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleWishlist(watch)}
            className={isWishlisted ? 'text-[#B8934A]' : ''}
          >
            {isWishlisted ? t('card.removeFromWishlist') : t('card.saveToWishlist')}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-0 sm:px-6 pt-0 sm:pt-6">
        <div className="flex flex-col lg:flex-row gap-0 sm:gap-8 lg:gap-12 w-full max-w-full overflow-hidden">
          
          {/* 
            Left column: Gallery 
          */}
          <div className="w-full lg:w-[55%] shrink-0">
            <div className="relative w-full aspect-square sm:rounded-2xl overflow-hidden bg-[#F5F2EC]">
              <div
                ref={trackRef}
                onScroll={handleScroll}
                data-carousel-track
                className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-none"
                style={{ 
                  scrollBehavior: 'auto',
                  overscrollBehaviorX: 'contain',
                }}
              >
                {watch.images.map((src, i) => (
                  <div key={i} className="w-full h-full shrink-0 snap-center relative">
                    {!loadedImages.has(i) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-[#D8CBB5] border-t-[#B8934A] rounded-full animate-spin" />
                      </div>
                    )}
                    <img
                      src={src}
                      alt={`${watch.name} - View ${i + 1}`}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      referrerPolicy="no-referrer"
                      onLoad={() => handleImageLoad(i)}
                      onError={(e) => handleImageError(i, e)}
                      className={`w-full h-full object-cover transition-opacity duration-500 ${
                        loadedImages.has(i) ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={loadedImages.has(i) ? undefined : { display: 'none' }}
                    />
                  </div>
                ))}
              </div>

              {watch.isNewRelease && (
                <div className="absolute top-3 sm:top-4 start-3 sm:start-4 px-2.5 py-1 bg-[#B8934A] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] rounded-full shadow-md z-10">
                  {t('common.isNew')}
                </div>
              )}
              {watch.isLimitedEdition && (
                <div className="absolute top-3 sm:top-4 start-3 sm:start-4 px-2.5 py-1 bg-[#221F1B] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] rounded-full shadow-md z-10">
                  {'Limited Edition'}
                </div>
              )}

              {watch.images.length > 1 && (
                <div className="absolute bottom-3 sm:bottom-4 end-3 sm:end-4 bg-black/40 backdrop-blur-md text-white text-[10px] font-mono px-2.5 py-1 rounded-full z-10 force-ltr">
                  {activePhotoIndex + 1} / {watch.images.length}
                </div>
              )}
              
              <div className="absolute bottom-3 sm:bottom-4 start-3 sm:start-4 z-10">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Eye className="w-3.5 h-3.5 text-[#B8934A]" />}
                  onClick={() => onOpenTryOn(watch)}
                  className="shadow-md"
                >
                  {t('tryon.title')}
                </Button>
              </div>

              {watch.images.length > 1 && (
                <>
                  <button
                    onClick={() => scrollToImage(Math.max(0, activePhotoIndex - 1))}
                    disabled={activePhotoIndex === 0}
                    aria-label={t('detail.previousImage')}
                    className="absolute start-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 backdrop-blur border border-white/40 shadow-sm flex items-center justify-center text-[#221F1B] disabled:opacity-0 transition-opacity z-10"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                  <button
                    onClick={() => scrollToImage(Math.min(watch.images.length - 1, activePhotoIndex + 1))}
                    disabled={activePhotoIndex === watch.images.length - 1}
                    aria-label={t('detail.nextImage')}
                    className="absolute end-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 backdrop-blur border border-white/40 shadow-sm flex items-center justify-center text-[#221F1B] disabled:opacity-0 transition-opacity z-10"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {watch.images.length > 1 && (
              <div className="mt-3 px-3 sm:px-0 flex gap-2 overflow-x-auto snap-x pb-2 scrollbar-none w-full max-w-full">
                {watch.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToImage(i)}
                    className={`relative w-16 sm:w-20 aspect-square rounded-lg overflow-hidden shrink-0 snap-start transition-all ${
                      i === activePhotoIndex
                        ? 'ring-2 ring-[#B8934A] ring-offset-1 ring-offset-[#FCFBF9]'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={src}
                      alt={`Thumbnail ${i + 1}`}
                      referrerPolicy="no-referrer"
                      onError={(e) => handleImageError(i, e)}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            
            {hasMultipleGenders && (
              <div className="mt-4 px-3 sm:px-0">
                <div className="surface-card p-3 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#8C8275] font-semibold flex-1">
                    {'Available in'}
                  </span>
                  <div className="flex bg-[#F5F2EC] rounded-full p-0.5 border border-[#E8E2D5]">
                    {allListings.map(listing => (
                      <button
                        key={listing.id}
                        disabled={listing.category === parentGrid}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          listing.category === parentGrid
                            ? 'bg-white text-[#B8934A] shadow-xs cursor-default'
                            : 'text-[#8C8275] hover:text-[#221F1B]'
                        }`}
                      >
                        {listing.category === 'men' ? t('cat.menTitle') : t('cat.womenTitle')}
                      </button>
                    ))}
                  </div>
                  <div className="w-full text-[9px] text-[#8C8275] mt-1 italic">
                    {'Return to Collections'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 
            Right column: Product info 
          */}
          <div className="w-full lg:w-[45%] shrink-0 px-4 sm:px-0 mt-6 lg:mt-0 flex flex-col max-w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono tracking-wider text-[#8C8275] force-ltr">
                {watch.referenceNumber}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#B8934A]">
                {translatedSubCollection}
              </span>
            </div>

            <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#221F1B] font-light leading-tight">
              {watch.name}
            </h1>
            
            <p className="text-sm text-[#736B60] mt-3 leading-relaxed">
              {watch.shortDescription}
            </p>

            <div className="mt-5 pb-5 border-b border-[#E8E2D5] flex items-end justify-between">
              <div className="font-serif-luxury text-3xl text-[#221F1B] font-semibold force-ltr inline-block">
                {formattedPriceVal}
              </div>
              <div className="text-[11px] text-[#B8934A] font-semibold uppercase tracking-wider bg-[#B8934A]/10 px-2.5 py-1 rounded-full">
                {watch.inStock ? t('detail.inStock') : 'Out of Stock'}
              </div>
            </div>

            <div className="py-5 border-b border-[#E8E2D5] space-y-4">
              {/* Personalization Options */}
              <div className="space-y-3">
                <button
                  onClick={() => setWantsEngraving(!wantsEngraving)}
                  className="flex items-center justify-between w-full group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${wantsEngraving ? 'bg-[#B8934A] border-[#B8934A]' : 'border-[#D8CBB5] group-hover:border-[#B8934A]'}`}>
                      {wantsEngraving && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <PenTool className="w-4 h-4 text-[#8C8275]" />
                    <span className="text-sm text-[#221F1B] font-medium">{t('detail.engravingTitle')}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[#B8934A] tracking-wider">{'Free'}</span>
                </button>
                <AnimatePresence>
                  {wantsEngraving && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <input
                        type="text"
                        placeholder={t('detail.engravingPlaceholder')}
                        value={engravingText}
                        onChange={(e) => setEngravingText(e.target.value)}
                        maxLength={20}
                        className="w-full bg-white border border-[#E8E2D5] focus:border-[#B8934A] rounded-xl p-2.5 text-sm text-[#221F1B] outline-none ms-6 w-[calc(100%-24px)]"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={() => setWantsGiftWrap(!wantsGiftWrap)}
                  className="flex items-center justify-between w-full group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${wantsGiftWrap ? 'bg-[#B8934A] border-[#B8934A]' : 'border-[#D8CBB5] group-hover:border-[#B8934A]'}`}>
                      {wantsGiftWrap && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <Box className="w-4 h-4 text-[#8C8275]" />
                    <span className="text-sm text-[#221F1B] font-medium">{'Gift Box'}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[#B8934A] tracking-wider">{'Free'}</span>
                </button>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-[#221F1B] font-medium">{'Quantity'}</span>
                <div className="flex items-center bg-white border border-[#E8E2D5] rounded-full overflow-hidden force-ltr">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center text-[#8C8275] hover:bg-[#F5F2EC] disabled:opacity-30 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(5, quantity + 1))}
                    disabled={quantity >= 5}
                    className="w-8 h-8 flex items-center justify-center text-[#8C8275] hover:bg-[#F5F2EC] disabled:opacity-30 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="py-5 flex flex-col gap-3">
              <Button
                variant="primary"
                size="lg"
                block
                disabled={!watch.inStock}
                onClick={() => {
                  for (let i = 0; i < quantity; i++) {
                    onAddToCart(watch, wantsEngraving ? engravingText : undefined, wantsGiftWrap, activePhotoIndex + 1);
                  }
                }}
              >
                {t('detail.acquire', { price: '' })}
              </Button>
              <Button
                variant="whatsapp"
                size="lg"
                block
                icon={<MessageSquare className="w-4 h-4 fill-white" />}
                onClick={handleDirectWhatsApp}
              >
                {(() => {
                  const text = t('detail.orderWhatsApp');
                  const parts = text.split('0652297244');
                  if (parts.length > 1) {
                    return (
                      <>
                        {parts[0]}
                        <bdi className="force-ltr">0652297244</bdi>
                        {parts[1]}
                      </>
                    );
                  }
                  return text;
                })()}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="surface-card p-3 flex items-center gap-2 text-[10px] text-[#736B60] font-medium leading-tight">
                <Shield className="w-4 h-4 text-[#B8934A] shrink-0" />
                <span>{t('detail.guarantee')}</span>
              </div>
              <div className="surface-card p-3 flex items-center gap-2 text-[10px] text-[#736B60] font-medium leading-tight">
                <RotateCcw className="w-4 h-4 text-[#B8934A] shrink-0" />
                <span>{'Exchange available'}</span>
              </div>
              <div className="surface-card p-3 flex items-center gap-2 text-[10px] text-[#736B60] font-medium leading-tight">
                <CreditCard className="w-4 h-4 text-[#B8934A] shrink-0" />
                <span>{t('common.cashOnDelivery')}</span>
              </div>
              <button 
                onClick={() => onOpenConcierge(watch, activePhotoIndex + 1)}
                className="surface-card p-3 flex items-center gap-2 text-[10px] text-[#B8934A] font-bold leading-tight hover:ring-1 hover:ring-[#B8934A]/30 transition-all text-start"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>{t('detail.specialistHelp')}</span>
              </button>
            </div>

            {hasVideo && <MovementVideo type={watch.specs.movement as 'chrono' | 'auto'} isRtl={isRtl} />}

            {/* Specifications Accordion */}
            <div className="mt-6 border-t border-[#E8E2D5]">
              <button
                onClick={() => setShowSpecs(!showSpecs)}
                className="flex items-center justify-between w-full py-4 text-start group cursor-pointer"
              >
                <span className="font-serif-luxury text-lg text-[#221F1B] group-hover:text-[#B8934A] transition-colors">{t('detail.specsTitle')}</span>
                <ChevronDown className={`w-5 h-5 text-[#8C8275] transition-transform duration-300 ${showSpecs ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showSpecs && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                      <div className="flex justify-between border-b border-[#F5F2EC] pb-2">
                        <span className="text-[#8C8275]">{t('detail.caseMaterial')}</span>
                        <span className="text-[#221F1B] font-medium text-end">{translatedMaterial}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#F5F2EC] pb-2">
                        <span className="text-[#8C8275]">{t('detail.diameter')}</span>
                        <span className="text-[#221F1B] font-medium force-ltr text-end">{formattedDiameter}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#F5F2EC] pb-2">
                        <span className="text-[#8C8275]">{'Thickness'}</span>
                        <span className="text-[#221F1B] font-medium force-ltr text-end">{formattedThickness}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#F5F2EC] pb-2">
                        <span className="text-[#8C8275]">{t('detail.movement')}</span>
                        <span className="text-[#221F1B] font-medium text-end">{translatedMovement}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#F5F2EC] pb-2">
                        <span className="text-[#8C8275]">{t('detail.strapMaterial')}</span>
                        <span className="text-[#221F1B] font-medium text-end">{translatedStrap}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#F5F2EC] pb-2">
                        <span className="text-[#8C8275]">{t('detail.glass')}</span>
                        <span className="text-[#221F1B] font-medium text-end">{translatedGlass}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#F5F2EC] pb-2">
                        <span className="text-[#8C8275]">{t('detail.waterResistance')}</span>
                        <span className="text-[#221F1B] font-medium text-end">{tData('waterResistance', watch.specs.waterResistance)}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#F5F2EC] pb-2">
                        <span className="text-[#8C8275]">{t('detail.buckle')}</span>
                        <span className="text-[#221F1B] font-medium text-end">{translatedBuckle}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-8 p-5 bg-[#F5F2EC] rounded-2xl relative overflow-hidden">
              <Sparkles className="absolute -top-3 -end-3 w-16 h-16 text-[#E8E2D5] opacity-50 pointer-events-none" />
              <h3 className="font-serif-luxury text-lg text-[#221F1B] mb-2">{t('detail.storyTitle')}</h3>
              <p className="text-sm text-[#736B60] leading-relaxed mb-4">
                {watch.fullDescription}
              </p>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-[#B8934A]">
                {watch.storySnippet}
              </div>
            </div>

            {watch.disclaimer && (
              <div className="mt-4 text-[10px] text-[#8C8275] leading-relaxed italic border-s-2 border-[#D8CBB5] ps-3">
                {t('tryon.disclaimer')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
