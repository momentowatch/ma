import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Shield, Award } from 'lucide-react';
import { Category } from '../types';
import { LISTING_STATS } from '../data/watches';
import LanguageSwitcher from './LanguageSwitcher';
import { useI18n, type TranslationKey } from '../i18n';

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
  titleKey: TranslationKey;
  kickerKey: TranslationKey;
  sources: string[];
  count: number;
  altKey: TranslationKey;
}

const PANELS: GatePanel[] = [
  {
    category: 'men',
    titleKey: 'gate.men',
    kickerKey: 'gate.kickerMen',
    sources: posterSources('watch/gate/male.webp'),
    count: LISTING_STATS.men,
    altKey: 'gate.altMen',
  },
  {
    category: 'women',
    titleKey: 'gate.women',
    kickerKey: 'gate.kickerWomen',
    sources: posterSources('watch/gate/female.webp'),
    count: LISTING_STATS.women,
    altKey: 'gate.altWomen',
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
  const { t } = useI18n();
  const [sourceIndex, setSourceIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const tilt = useTilt(5);

  const src = panel.sources[sourceIndex] ?? panel.sources[0];
  const fallbacks = panel.sources.slice(sourceIndex + 1);

  const choose = () => onChoose(panel.category, tilt.ref.current, src, fallbacks);

  const displayTitle = t(panel.titleKey);

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
        aria-label={t('gate.enter', { collection: displayTitle })}
        onKeyDown={(event) => {
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
            alt={t(panel.altKey)}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            draggable={false}
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            onError={() => setSourceIndex((index) => (index + 1 < panel.sources.length ? index + 1 : index))}
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
  const { t } = useI18n();

  // Warm both posters so the second one is instant if the shopper switches.
  useEffect(() => {
    PANELS.forEach((panel) => {
      const image = new Image();
      image.src = panel.sources[0];
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#221F1B] flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden w-full max-w-full page-enter">
      {/*
        Overlay language switcher.
        The positioning lives on this wrapper, never on the switcher itself:
        LanguageSwitcher's root is `position: relative` because it is the
        containing block for its own dropdown. Passing `absolute` down would
        put two position utilities on one element, and `.relative` wins the
        cascade — which detaches the menu from its trigger.
      */}
      <div className="absolute top-4 end-4 z-30">
        <LanguageSwitcher variant="overlay" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-12%] end-[-12%] w-[340px] h-[340px] bg-[#F5E6D3] rounded-full blur-[110px] opacity-45" />
        <div className="absolute bottom-[-12%] start-[-12%] w-[340px] h-[340px] bg-[#EAE7DC] rounded-full blur-[110px] opacity-35" />
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
          {t('gate.boutique')}
        </p>
      </motion.header>

      <main className="my-auto py-4 sm:py-8 max-w-5xl mx-auto w-full relative z-10">
        <p className="text-center text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-[#8C8275] mb-4">
          {t('gate.choose')}
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
            <span>{t('gate.exploreAll', { count: LISTING_STATS.listings })}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
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
            <span>{t('common.realPhotos')}</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#B8934A]" />
            <span>{t('common.cashOnDelivery')}</span>
          </div>
        </div>
        <div className="text-center text-[9px] text-[#BFBFBF] tracking-tight mt-4 space-y-1">
          <p>{t('gate.disclaimer')}</p>
          <p>{t('gate.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </motion.footer>
    </div>
  );
};
