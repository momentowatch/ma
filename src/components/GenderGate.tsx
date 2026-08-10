import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Shield, Award } from 'lucide-react';
import { Category } from '../types';
import { LISTING_STATS } from '../data/watches';
import { useZoomTransition } from './transitions/ZoomTransition';

const PAGES_BASE = 'https://noureddinelmobaraki-web.github.io/nl-audio-cdn/';
const JSDELIVR_BASE = 'https://cdn.jsdelivr.net/gh/noureddinelmobaraki-web/nl-audio-cdn@main/';
const RAW_BASE = 'https://raw.githubusercontent.com/noureddinelmobaraki-web/nl-audio-cdn/main/';

const posterSources = (file: string): string[] => [
  PAGES_BASE + file,
  JSDELIVR_BASE + file,
  RAW_BASE + file,
];

interface GatePanel {
  category: Category;
  title: string;
  kicker: string;
  sources: string[];
  count: number;
  alt: string;
}

const PANELS: GatePanel[] = [
  {
    category: 'men',
    title: "Men's",
    kicker: 'The Gentleman Series',
    sources: posterSources('watch/gate/male.webp'),
    count: LISTING_STATS.men,
    alt: "Men's watch collection — Casa Watch Casablanca",
  },
  {
    category: 'women',
    title: "Women's",
    kicker: 'The Signature Series',
    sources: posterSources('watch/gate/female.webp'),
    count: LISTING_STATS.women,
    alt: "Women's watch collection — Casa Watch Casablanca",
  },
];

/** Pointer-following tilt, disabled on touch and on reduced motion. */
function useTilt(max = 5) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node || event.pointerType !== 'mouse') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = node.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width - 0.5;
    const py = (event.clientY - box.top) / box.height - 0.5;
    node.style.transform =
      'perspective(1200px) rotateY(' + px * max * 2 + 'deg) rotateX(' + -py * max * 2 + 'deg) translateZ(0)';
  };

  const reset = () => {
    const node = ref.current;
    if (node) node.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg) translateZ(0)';
  };

  return { ref, onPointerMove, onPointerLeave: reset, onPointerUp: reset };
}

interface PosterCardProps {
  panel: GatePanel;
  delay: number;
  onChoose: (category: Category, element: HTMLElement | null, src: string, fallbacks: string[]) => void;
}

const PosterCard: React.FC<PosterCardProps> = ({ panel, delay, onChoose }) => {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const tilt = useTilt(5);

  const src = panel.sources[sourceIndex] ?? panel.sources[0];
  const fallbacks = panel.sources.slice(sourceIndex + 1);

  const choose = () => onChoose(panel.category, tilt.ref.current, src, fallbacks);

  const displayTitle = panel.category === 'men' ? 'Men' : 'Women';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className="h-full flex flex-col items-center group cursor-pointer"
      onClick={choose}
    >
      <div
        ref={tilt.ref}
        role="button"
        tabIndex={0}
        aria-label={'Enter the ' + displayTitle + ' collection'}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            choose();
          }
        }}
        onPointerMove={tilt.onPointerMove}
        onPointerLeave={tilt.onPointerLeave}
        onPointerUp={tilt.onPointerUp}
        className="poster-card poster-sheen w-full aspect-[3/4] sm:aspect-[4/5] rounded-2xl overflow-hidden relative shadow-md transition-shadow group-hover:shadow-xl"
      >
        {/* Artwork */}
        <div className="poster-media">
          <img
            src={src}
            alt={panel.alt}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            draggable={false}
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            onError={() => setSourceIndex(index => (index + 1 < panel.sources.length ? index + 1 : index))}
            style={{ opacity: loaded ? 1 : 0, transition: 'opacity 500ms cubic-bezier(0.22,1,0.36,1)' }}
          />
        </div>

        {/* Subtle hover edge effect */}
        <div className="poster-edge" />
      </div>

      {/* Label placed outside the image */}
      <div className="mt-3.5 text-center">
        <h2 className="font-serif-luxury text-xl sm:text-2xl font-medium tracking-[0.15em] uppercase text-[#221F1B] group-hover:text-[#B8934A] transition-colors">
          {displayTitle}
        </h2>
      </div>
    </motion.div>
  );
};

interface GenderGateProps {
  onSelectCategory: (
    category: Category,
    element: HTMLElement | null,
    src: string,
    fallbacks: string[]
  ) => void;
}

export const GenderGate: React.FC<GenderGateProps> = ({ onSelectCategory }) => {
  // Warm both posters so the second one is instant if the shopper switches.
  useEffect(() => {
    PANELS.forEach(panel => {
      const image = new Image();
      image.src = panel.sources[0];
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#221F1B] flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden w-full max-w-full page-enter">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-12%] right-[-12%] w-[340px] h-[340px] bg-[#F5E6D3] rounded-full blur-[110px] opacity-45" />
        <div className="absolute bottom-[-12%] left-[-12%] w-[340px] h-[340px] bg-[#EAE7DC] rounded-full blur-[110px] opacity-35" />
      </div>

      <motion.header
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center pt-6 pb-2 relative z-10"
      >
        <h1 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-light tracking-[0.25em] uppercase">
          MOMENTO
        </h1>
        <p className="mt-2 text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#8C8275]">
          Casa Watch Boutique
        </p>
      </motion.header>

      <main className="my-auto py-4 sm:py-8 max-w-5xl mx-auto w-full relative z-10">
        <p className="text-center text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-[#8C8275] mb-4">
          Choose your collection
        </p>
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {PANELS.map((panel, index) => (
            <PosterCard
              key={panel.category}
              panel={panel}
              delay={0.1 + index * 0.08}
              onChoose={onSelectCategory}
            />
          ))}
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => onSelectCategory('all', null, PANELS[0].sources[0], [])}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#221F1B] hover:bg-[#B8934A] text-white text-xs font-semibold uppercase tracking-[0.2em] rounded-full shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <span>Explore Full Collection ({LISTING_STATS.listings} Timepieces)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </main>

      <motion.footer
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="border-t border-[#E5E1D8] pt-5 pb-3 relative z-10"
      >
        <div className="max-w-2xl mx-auto flex items-center justify-around text-[#8C8275] text-[10px] sm:text-[11px] tracking-widest uppercase font-medium">
          <div className="flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-[#B8934A]" />
            <span>Real Photos</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#B8934A]" />
            <span>Cash on Delivery</span>
          </div>
        </div>
        <div className="text-center text-[9px] text-[#BFBFBF] tracking-tight mt-4 space-y-1">
          <p>Design-inspired timepieces. Brand names refer to the design style only and are not affiliated with the trademark owners.</p>
          <p>© {new Date().getFullYear()} MOMENTO · CASA WATCH BOUTIQUE.</p>
        </div>
      </motion.footer>
    </div>
  );
};
