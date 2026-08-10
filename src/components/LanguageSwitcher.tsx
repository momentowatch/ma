import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, Globe, X } from 'lucide-react';
import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { LOCALES, LOCALE_META, useI18n, type Locale } from '../i18n';

type Props = {
  /**
   * `header` renders the compact trigger used inside the sticky bar.
   * `overlay` renders the slightly stronger trigger used on the gender gate,
   * which sits directly on top of full-bleed photography.
   */
  variant?: 'header' | 'overlay';
  className?: string;
};

const REGION_SUBTITLES: Record<Locale, string> = {
  ar: 'المغرب · DH',
  fr: 'Maroc · DH',
  en: 'Morocco · DH',
};

const LanguageSwitcher = ({ variant = 'header', className = '' }: Props) => {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => LOCALES.indexOf(locale));
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  // Close on outside pointer down and on Escape.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close(true);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  useEffect(() => {
    if (open) setActiveIndex(LOCALES.indexOf(locale));
  }, [open, locale]);

  const choose = (next: Locale) => {
    setLocale(next);
    close(true);
  };

  const onTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen(true);
    }
  };

  const onMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % LOCALES.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + LOCALES.length) % LOCALES.length);
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(LOCALES.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(LOCALES[activeIndex]);
    } else if (event.key === 'Tab') {
      close();
    }
  };

  const triggerTone =
    variant === 'overlay'
      ? 'bg-white/90 backdrop-blur-md border-white/80 text-[#221F1B] shadow-md hover:bg-white'
      : open
      ? 'bg-[#FAF6F0] border-[#B8934A]/50 text-[#221F1B] shadow-xs'
      : 'bg-[#FAF8F5]/80 hover:bg-white border-[#E8E2D5] text-[#221F1B] hover:border-[#B8934A]/40';

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.02,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
  };

  const renderOptionList = (prefix: string) => {
    return LOCALES.map((code, index) => {
      const meta = LOCALE_META[code];
      const isActive = code === locale;
      const isHovered = index === activeIndex;

      return (
        <motion.button
          key={`${prefix}-${code}`}
          type="button"
          role="menuitemradio"
          aria-checked={isActive}
          tabIndex={-1}
          lang={meta.tag}
          variants={itemVariants}
          onMouseEnter={() => setActiveIndex(index)}
          onClick={() => choose(code)}
          className={[
            'group relative flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 sm:py-2 text-start',
            'transition-all duration-200 cursor-pointer select-none touch-manipulation',
            isActive
              ? 'bg-[#B8934A]/10 border border-[#B8934A]/30 text-[#221F1B] font-semibold'
              : isHovered
              ? 'bg-[#F4EFE6] border border-transparent text-[#221F1B]'
              : 'bg-transparent border border-transparent text-[#4A443C] hover:bg-[#F8F5EF]',
          ].join(' ')}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#FAF6F0] border border-[#E8E2D5] text-xs font-extrabold text-[#B8934A] shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <span className="text-[11px] tracking-wider uppercase font-bold text-[#B8934A]">{meta.short}</span>
            </div>
            <div className="min-w-0 flex flex-col">
              <span className="text-sm font-semibold text-[#221F1B]">
                <bdi>{meta.nativeName}</bdi>
              </span>
              <span className="text-[10px] text-[#8C8275] truncate">
                {REGION_SUBTITLES[code]}
              </span>
            </div>
          </div>

          {isActive && (
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#B8934A] text-white shrink-0 shadow-xs">
              <Check size={14} strokeWidth={2.5} />
            </div>
          )}
        </motion.button>
      );
    });
  };

  return (
    <div ref={rootRef} className={`relative w-fit ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`${t('lang.trigger')} — ${t('lang.current', { name: LOCALE_META[locale].nativeName })}`}
        title={t('lang.trigger')}
        className={[
          'inline-flex min-h-[38px] sm:min-h-[40px] items-center justify-center gap-1.5',
          'rounded-full border px-3 text-xs font-semibold tracking-wide transition-all duration-300',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8934A]/60 active:scale-95 cursor-pointer',
          triggerTone,
        ].join(' ')}
      >
        <Globe size={15} strokeWidth={1.8} className="text-[#B8934A] shrink-0" aria-hidden="true" />
        <span className="text-[11px] sm:text-xs font-bold tracking-wider text-[#221F1B]">
          {LOCALE_META[locale].short}
        </span>
        <ChevronDown
          size={13}
          strokeWidth={2.2}
          aria-hidden="true"
          className={`text-[#8C8275] transition-transform duration-300 ${open ? 'rotate-180 text-[#B8934A]' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <>
            {/* ---------- PHONE / MOBILE: Elegant Bottom Sheet Modal Portaled to Body ---------- */}
            {typeof document !== 'undefined' &&
              createPortal(
                <AnimatePresence>
                  {open && (
                    <>
                      <motion.div
                        key="scrim"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => close()}
                        className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-xs sm:hidden"
                        aria-hidden="true"
                      />
                      <motion.div
                        key="sheet"
                        role="menu"
                        id={`${menuId}-mobile`}
                        aria-label={t('lang.label')}
                        tabIndex={-1}
                        onKeyDown={onMenuKeyDown}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                        className={[
                          'fixed inset-x-0 bottom-0 z-[1000] sm:hidden',
                          'rounded-t-[28px] border-t border-[#E8E2D5] bg-[#FCFBF9]',
                          'p-5 pb-[calc(1.75rem+env(safe-area-inset-bottom))] shadow-[0_-16px_48px_rgba(34,31,27,0.25)]',
                          'max-h-[80vh] overflow-y-auto',
                        ].join(' ')}
                      >
                        {/* Grab handle */}
                        <div className="w-12 h-1 rounded-full bg-[#E5E1D8] mx-auto mb-4 shrink-0" />

                        {/* Sheet Header */}
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0EAE0]">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#B8934A]/10 flex items-center justify-center text-[#B8934A]">
                              <Globe size={16} strokeWidth={2} />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-[#221F1B] font-serif-luxury">
                                {t('lang.sheetTitle')}
                              </h3>
                              <p className="text-[10px] text-[#8C8275]">MOMENTO Casa Watch</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => close()}
                            className="p-1.5 rounded-full hover:bg-[#F5F2EC] text-[#8C8275] hover:text-[#221F1B] transition-colors"
                            aria-label="Close"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        {/* Options list */}
                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          animate="show"
                          className="space-y-2"
                        >
                          {renderOptionList('mobile')}
                        </motion.div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>,
                document.body,
              )}

            {/* ---------- DESKTOP / LAPTOP: Anchored Floating Dropdown ---------- */}
            <motion.div
              key="menu"
              role="menu"
              id={menuId}
              aria-label={t('lang.label')}
              tabIndex={-1}
              onKeyDown={onMenuKeyDown}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={[
                'absolute end-0 top-[calc(100%+8px)] z-[101] hidden sm:block',
                'w-[230px] overflow-hidden rounded-2xl border border-[#E8E2D5] bg-[#FCFBF9]/98 backdrop-blur-xl',
                'p-2.5 shadow-[0_20px_50px_rgba(34,31,27,0.18)] space-y-1',
              ].join(' ')}
            >
              <div className="px-3 py-1.5 text-[10px] font-bold text-[#8C8275] tracking-widest uppercase border-b border-[#F0EAE0] mb-1">
                {t('lang.sheetTitle')}
              </div>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-1"
              >
                {renderOptionList('desktop')}
              </motion.div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
