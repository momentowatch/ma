const fs = require('fs');

const file = fs.readFileSync('src/components/WatchDetailPage.tsx', 'utf8');
const lines = file.split('\n');

const trueReturnLine = 277; // 0-indexed is 277 for line 278
const originalJSX = lines.slice(trueReturnLine).join('\n');

const topPart = `import React, { useEffect, useRef, useState } from 'react';
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
  const touchStartScrollLeft = useRef(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const totalImages = watch.images.length;

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !container.clientWidth) return;

    const targetLeft = activeImageIndex * container.clientWidth;
    if (Math.abs(container.scrollLeft - targetLeft) <= 1) return;

    // A wrap jump (last -> first, or first -> last) crosses the whole strip.
    // Smooth-scrolling that distance outlives any fixed guard window, so the
    // scroll listener reads a mid-flight position and cancels the wrap.
    // Wrap jumps are therefore instant; neighbouring moves stay smooth.
    const isWrapJump =
      Math.abs(targetLeft - container.scrollLeft) > container.clientWidth * 1.5;

    isProgrammaticScroll.current = true;

    if (isWrapJump) {
      // The container carries the \`scroll-smooth\` class, so both scrollTo({
      // behavior: 'auto' }) and a direct scrollLeft assignment would animate.
      // Neutralise it for the single frame of the jump, then restore it.
      const previousBehavior = container.style.scrollBehavior;
      container.style.scrollBehavior = 'auto';
      container.scrollLeft = targetLeft;
      container.style.scrollBehavior = previousBehavior;
    } else {
      container.scrollTo({ left: targetLeft, behavior: 'smooth' });
    }

    // Release the guard when the strip has actually settled, not after a fixed
    // timeout that the wrap distance always outruns.
    let frame = 0;
    let stableFrames = 0;
    const release = () => {
      stableFrames =
        Math.abs(container.scrollLeft - targetLeft) <= 1 ? stableFrames + 1 : 0;
      if (stableFrames >= 3) {
        isProgrammaticScroll.current = false;
        return;
      }
      frame = requestAnimationFrame(release);
    };
    frame = requestAnimationFrame(release);

    const failSafe = window.setTimeout(() => {
      cancelAnimationFrame(frame);
      isProgrammaticScroll.current = false;
    }, 900);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(failSafe);
      isProgrammaticScroll.current = false;
    };
  }, [activeImageIndex]);

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
    setActiveImageIndex(prev => prev === 0 ? totalImages - 1 : prev - 1);
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (totalImages <= 1) return;
    setActiveImageIndex(prev => prev === totalImages - 1 ? 0 : prev + 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // A finger on the strip always wins over an in-flight programmatic scroll.
    isProgrammaticScroll.current = false;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartScrollLeft.current = scrollContainerRef.current
      ? scrollContainerRef.current.scrollLeft
      : 0;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    const startLeft = touchStartScrollLeft.current;
    touchStartX.current = null;
    touchStartY.current = null;

    if (totalImages <= 1) return;
    if (Math.abs(deltaX) <= Math.abs(deltaY) || Math.abs(deltaX) <= 35) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const maxLeft = container.scrollWidth - container.clientWidth;
    if (maxLeft <= 1) return;

    // Native scroll-snap already resolves every interior swipe. Advancing here
    // as well moved two photos per swipe. Take over only at an edge the strip
    // was already resting on before the finger landed and is still resting on
    // now - that is precisely where the browser cannot move and the loop must
    // happen. A long drag that merely arrives at an edge is left alone.
    const startedAtEnd = startLeft >= maxLeft - 1;
    const startedAtStart = startLeft <= 1;
    const stillAtEnd = container.scrollLeft >= maxLeft - 1;
    const stillAtStart = container.scrollLeft <= 1;

    if (deltaX < 0 && startedAtEnd && stillAtEnd) {
      nextImage();
    } else if (deltaX > 0 && startedAtStart && stillAtStart) {
      prevImage();
    }
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

`;

// Note: Replace scrollToImage with setActiveImageIndex in the JSX part as required by the original logic.
const fixedJSX = originalJSX.replace(/scrollToImage\(/g, 'setActiveImageIndex(');
fs.writeFileSync('src/components/WatchDetailPage.tsx', topPart + fixedJSX);
