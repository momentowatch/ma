import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Heart, ChevronLeft, ChevronRight, MessageSquare, ShoppingBag } from 'lucide-react';
import { Watch } from '../types';
import { BackButton } from './ui/BackButton';
import { Button, IconButton } from './ui/Button';
import { createSingleWatchWhatsAppMessage, formatWhatsAppLink } from '../utils/whatsapp';

/* ------------------------------------------------------------------------- *
 * Looping photo carousel tuning
 * ------------------------------------------------------------------------- */
const SLIDE_MS = 460;
const SLIDE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const AXIS_LOCK_PX = 8;
const COMMIT_RATIO = 0.18;
const COMMIT_VELOCITY = 0.45;
const WHEEL_STEP_PX = 42;
const WHEEL_RESET_MS = 140;
const NEIGHBOUR_RADIUS = 2;

/**
 * Module-level decode cache. It outlives the component, so coming back to a
 * watch that was already viewed costs zero network and zero decode time.
 */
const warmedPhotos = new Set<string>();

const warmPhoto = (url?: string) => {
  if (!url || warmedPhotos.has(url)) return;
  warmedPhotos.add(url);
  const img = new Image();
  img.referrerPolicy = 'no-referrer';
  img.decoding = 'async';
  img.src = url;
  if (typeof img.decode === 'function') {
    img.decode().catch(() => {
      warmedPhotos.delete(url);
    });
  }
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const totalImages = watch.images.length;
  const looping = totalImages > 1;

  /**
   * The track renders [clone of last, ...real photos, clone of first].
   * `position` is the index inside that track, so real photo i sits at i + 1.
   * Sliding onto a clone is a genuine animation; the moment it lands we swap to
   * its identical real twin with the transition switched off, which is
   * invisible. That is what makes last -> first slide instead of jump.
   */
  const maxPosition = looping ? totalImages + 1 : 0;
  const [position, setPosition] = useState(looping ? 1 : 0);

  const activeImageIndex = looping
    ? (((position - 1) % totalImages) + totalImages) % totalImages
    : 0;

  const slides = useMemo(() => {
    const real = watch.images.map((src, realIndex) => ({
      src,
      realIndex,
      key: 'photo-' + realIndex,
    }));
    if (!looping) return real;
    return [
      { src: watch.images[totalImages - 1], realIndex: totalImages - 1, key: 'clone-head' },
      ...real,
      { src: watch.images[0], realIndex: 0, key: 'clone-tail' },
    ];
  }, [watch.images, totalImages, looping]);

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(position);
  const maxPositionRef = useRef(maxPosition);
  const loopingRef = useRef(looping);
  const paintedRef = useRef(-1);
  const dragPxRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const axisRef = useRef<'idle' | 'x'>('idle');
  const rafRef = useRef(0);
  const settleTimerRef = useRef(0);

  useLayoutEffect(() => {
    positionRef.current = position;
    maxPositionRef.current = maxPosition;
    loopingRef.current = looping;
  });

  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

  /** Single writer for the track transform. Percentages resolve against the
   *  track's own border box, which is exactly one viewport wide. */
  const paint = useCallback((pos: number, offsetPx: number, withTransition: boolean) => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = withTransition ? 'transform ' + SLIDE_MS + 'ms ' + SLIDE_EASE : 'none';
    track.style.transform = 'translate3d(calc(' + -pos * 100 + '% + ' + offsetPx + 'px), 0, 0)';
  }, []);

  /**
   * The one and only way the track ever moves. Ref, DOM and React state are
   * written together and synchronously, so nothing can read a stale position
   * and a skipped re-render can never swallow a move.
   */
  const applyPosition = useCallback((next: number, withTransition: boolean) => {
    positionRef.current = next;
    paintedRef.current = next;
    paint(next, 0, withTransition);
    setPosition(next);
  }, [paint]);

  /** Reconciliation only. A live drag offset is transient, so it is left alone. */
  useLayoutEffect(() => {
    if (paintedRef.current === position) return;
    paintedRef.current = position;
    paint(position, 0, false);
  }, [position, paint]);

  /**
   * Swaps a clone for its identical real twin with the transition off.
   * Idempotent and synchronous, so it is safe to call before any move: once it
   * returns, the current position is guaranteed to be a real photo.
   */
  const settle = useCallback(() => {
    window.clearTimeout(settleTimerRef.current);
    if (!loopingRef.current) return;
    const pos = positionRef.current;
    const max = maxPositionRef.current;
    if (pos !== 0 && pos !== max) return;
    applyPosition(pos === 0 ? max - 1 : 1, false);
    const track = trackRef.current;
    if (track) {
      // Flush the swap into the computed style so a move issued in this same
      // tick starts from here instead of sliding across the whole strip.
      void track.offsetWidth;
    }
  }, [applyPosition]);

  /**
   * transitionend is only an accelerator. This timer is the guarantee, so an
   * interrupted, cancelled or dropped transition can never strand the track on
   * a clone - which is exactly what used to freeze the last photo.
   */
  const armSettle = useCallback(() => {
    window.clearTimeout(settleTimerRef.current);
    settleTimerRef.current = window.setTimeout(settle, SLIDE_MS + 60);
  }, [settle]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onTransitionDone = (event: TransitionEvent) => {
      if (event.target !== track || event.propertyName !== 'transform') return;
      settle();
    };
    track.addEventListener('transitionend', onTransitionDone);
    track.addEventListener('transitioncancel', onTransitionDone);
    return () => {
      track.removeEventListener('transitionend', onTransitionDone);
      track.removeEventListener('transitioncancel', onTransitionDone);
    };
  }, [settle]);

  /** Exactly one slide. Settling first means the target is never clamped. */
  const step = useCallback((direction: 1 | -1) => {
    if (!loopingRef.current) return;
    settle();
    applyPosition(positionRef.current + direction, true);
    armSettle();
  }, [applyPosition, armSettle, settle]);

  const goToIndex = useCallback((realIndex: number) => {
    settle();
    const next = loopingRef.current ? realIndex + 1 : 0;
    if (next === positionRef.current) return;
    applyPosition(next, true);
    armSettle();
  }, [applyPosition, armSettle, settle]);

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    step(-1);
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    step(1);
  };

  const endDrag = useCallback((commitDirection: 1 | -1 | 0) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    dragPxRef.current = 0;
    pointerIdRef.current = null;
    axisRef.current = 'idle';
    if (commitDirection === 0) {
      // Rebound to the photo we started from. Nothing else changes.
      paint(positionRef.current, 0, true);
      return;
    }
    step(commitDirection);
  }, [paint, step]);

  /* Pointer Events cover finger, mouse and pen through one code path. */
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!looping) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (pointerIdRef.current !== null) return;
    pointerIdRef.current = e.pointerId;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startTimeRef.current = now();
    axisRef.current = 'idle';
    dragPxRef.current = 0;
    // Land on a real photo before the finger moves, so grabbing the strip in
    // the middle of a wrap can never leave it parked on a clone.
    settle();
    paint(positionRef.current, 0, false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    if (axisRef.current === 'idle') {
      // Decide only once one axis is clearly ahead, so a swipe that starts
      // slightly diagonal is no longer thrown away.
      if (Math.abs(dx) >= AXIS_LOCK_PX && Math.abs(dx) > Math.abs(dy)) {
        axisRef.current = 'x';
        if (typeof e.currentTarget.setPointerCapture === 'function') {
          e.currentTarget.setPointerCapture(e.pointerId);
        }
      } else if (Math.abs(dy) >= AXIS_LOCK_PX && Math.abs(dy) > Math.abs(dx)) {
        // Vertical intent: give the gesture back to the page.
        pointerIdRef.current = null;
        return;
      } else {
        return;
      }
    }

    const width = viewportRef.current ? viewportRef.current.clientWidth : 1;
    dragPxRef.current = Math.max(-width, Math.min(width, dx));
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        paint(positionRef.current, dragPxRef.current, false);
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    const dx = dragPxRef.current;
    const width = viewportRef.current ? viewportRef.current.clientWidth : 1;
    const elapsed = Math.max(1, now() - startTimeRef.current);
    const velocity = Math.abs(dx) / elapsed;
    const far = Math.abs(dx) > width * COMMIT_RATIO;
    // A flick must still cover real distance, otherwise a fast twitch fired a
    // step in whatever direction the finger happened to jitter.
    const flick = velocity > COMMIT_VELOCITY && Math.abs(dx) > width * 0.06;
    const committed = axisRef.current === 'x' && (far || flick);
    const target = e.currentTarget;
    // endDrag first: releasing capture can fire pointerleave, and the guard in
    // handlePointerCancel must already see a cleared pointer id.
    endDrag(committed ? (dx < 0 ? 1 : -1) : 0);
    if (
      typeof target.hasPointerCapture === 'function' &&
      target.hasPointerCapture(e.pointerId)
    ) {
      target.releasePointerCapture(e.pointerId);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    endDrag(0);
  };

  /* Trackpad: horizontal wheel deltas, registered non-passive so the browser
     does not steal the gesture. Vertical deltas fall through to the page. */
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !looping) return;
    let accumulated = 0;
    let resetTimer = 0;
    let lastStepAt = 0;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      accumulated += event.deltaX;
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        accumulated = 0;
      }, WHEEL_RESET_MS);
      const stamp = now();
      if (Math.abs(accumulated) >= WHEEL_STEP_PX && stamp - lastStepAt > SLIDE_MS * 0.8) {
        lastStepAt = stamp;
        const direction: 1 | -1 = accumulated > 0 ? 1 : -1;
        accumulated = 0;
        step(direction);
      }
    };
    viewport.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      viewport.removeEventListener('wheel', onWheel);
      window.clearTimeout(resetTimer);
    };
  }, [looping, step]);

  /* Keyboard navigation for the left and right arrow keys. */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!looping) return;
      if (e.key === 'ArrowLeft') {
        step(-1);
      } else if (e.key === 'ArrowRight') {
        step(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [looping, step]);

  /* Reset to the first photo whenever a different watch is opened. */
  useLayoutEffect(() => {
    window.clearTimeout(settleTimerRef.current);
    applyPosition(totalImages > 1 ? 1 : 0, false);
  }, [watch.id, totalImages, applyPosition]);

  /* Warm the immediate neighbours so a swipe never waits on the network. */
  useEffect(() => {
    if (totalImages === 0) return;
    for (let offset = -NEIGHBOUR_RADIUS; offset <= NEIGHBOUR_RADIUS; offset += 1) {
      const index = (((activeImageIndex + offset) % totalImages) + totalImages) % totalImages;
      warmPhoto(watch.images[index]);
    }
  }, [activeImageIndex, totalImages, watch.images]);

  /* Warm the rest of the set while the browser is idle. */
  useEffect(() => {
    if (totalImages === 0) return;
    const warmAll = () => {
      watch.images.forEach(url => warmPhoto(url));
    };
    const scope = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    if (typeof scope.requestIdleCallback === 'function') {
      const handle = scope.requestIdleCallback(warmAll, { timeout: 2500 });
      return () => {
        if (typeof scope.cancelIdleCallback === 'function') scope.cancelIdleCallback(handle);
      };
    }
    const timer = window.setTimeout(warmAll, 900);
    return () => window.clearTimeout(timer);
  }, [watch.images, totalImages]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.clearTimeout(settleTimerRef.current);
    };
  }, []);

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
              {/* Looping photo track driven by finger, mouse drag and trackpad */}
              <div
                ref={viewportRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onPointerLeave={handlePointerCancel}
                className="w-full h-full overflow-hidden touch-pan-y select-none cursor-grab active:cursor-grabbing"
              >
                <div
                  ref={trackRef}
                  className="flex w-full h-full will-change-transform"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {slides.map((slide, slideIdx) => (
                    <div key={slide.key} className="w-full h-full flex-shrink-0 relative">
                      <img
                        src={slide.src}
                        alt={`${watch.name} - photo ${slide.realIndex + 1}`}
                        referrerPolicy="no-referrer"
                        decoding="async"
                        loading={Math.abs(slideIdx - position) <= 1 ? 'eager' : 'lazy'}
                        onError={(e) => {
                          const fallback = watch.imageFallbacks[slide.realIndex] || watch.imageFallbacks[0];
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
                    onClick={() => goToIndex(idx)}
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
                      goToIndex(idx);
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
