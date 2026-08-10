import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import React, { useCallback, useEffect, useId, useRef, useState } from 'react';

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
      ? 'bg-white/85 backdrop-blur-sm border-white/70 text-[#221F1B] shadow-[0_2px_10px_rgba(34,31,27,0.12)]'
      : 'bg-transparent border-transparent text-[#221F1B] hover:bg-[#F5F2EC]';

  const options = LOCALES.map((code, index) => {
    const meta = LOCALE_META[code];
    const isActive = code === locale;
    return (
      <button
        key={code}
        type="button"
        role="menuitemradio"
        aria-checked={isActive}
        tabIndex={-1}
        lang={meta.tag}
        onMouseEnter={() => setActiveIndex(index)}
        onClick={() => choose(code)}
        className={[
          'flex w-full items-center justify-between gap-3 px-4 text-start',
          'min-h-[44px] text-[0.95rem] transition-colors duration-150',
          index === activeIndex ? 'bg-[#F5F2EC]' : 'bg-transparent',
          isActive ? 'text-[#221F1B] font-medium' : 'text-[#4A443C]',
        ].join(' ')}
      >
        <span className="flex items-center gap-3">
          <span className="w-7 shrink-0 text-[0.7rem] font-semibold tracking-[0.08em] text-[#8C8275]">
            {meta.short}
          </span>
          {/*
            <bdi> isolates the Arabic name so it shapes and orders correctly
            without inheriting or imposing a direction on the row. Setting
            dir="rtl" on the row instead would mirror the whole row and break
            alignment with the English and French rows.
          */}
          <bdi>{meta.nativeName}</bdi>
        </span>
        {isActive ? <Check size={16} strokeWidth={2} className="text-[#B8934A]" /> : null}
      </button>
    );
  });

  // The root must stay `position: relative` — it is the containing block for
  // the desktop dropdown. Callers therefore must NOT pass a position utility;
  // they wrap this component in their own positioned element instead.
  if (import.meta.env.DEV && /\b(absolute|fixed|sticky)\b/.test(className)) {
    console.error(
      '[LanguageSwitcher] className must not contain a position utility ' +
        `(received "${className}"). Wrap the switcher in a positioned <div> instead — ` +
        'two position utilities on one element detach the menu from its trigger.',
    );
  }

  return (
    // `w-fit` stops the root from stretching if a caller drops it into a
    // stretching flex or grid container, which would push `end-0` to the
    // container edge instead of the trigger edge.
    <div ref={rootRef} className={`relative w-fit ${className}`}>
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
          'inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5',
          'rounded-full border px-2.5 transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8934A]/60',
          triggerTone,
        ].join(' ')}
      >
        <Globe size={17} strokeWidth={1.6} aria-hidden="true" />
        <span className="text-[0.7rem] font-semibold tracking-[0.08em]">
          {LOCALE_META[locale].short}
        </span>
        <ChevronDown
          size={13}
          strokeWidth={2}
          aria-hidden="true"
          className={`hidden sm:block transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <>
            {/* ---------- phone: bottom sheet ---------- */}
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => close()}
              className="fixed inset-0 z-[60] bg-[#221F1B]/35 sm:hidden"
              aria-hidden="true"
            />
            <motion.div
              key="sheet"
              role="menu"
              id={menuId}
              aria-label={t('lang.label')}
              tabIndex={-1}
              onKeyDown={onMenuKeyDown}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className={[
                'fixed inset-x-0 bottom-0 z-[61] sm:hidden',
                'rounded-t-2xl border-t border-[#E5E1D8] bg-[#FCFBF9]',
                'pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_40px_rgba(34,31,27,0.18)]',
              ].join(' ')}
            >
              <div className="flex items-center justify-center pt-3 pb-1">
                <span className="h-1 w-10 rounded-full bg-[#E5E1D8]" aria-hidden="true" />
              </div>
              <p className="px-4 pb-2 pt-1 text-[0.7rem] uppercase text-[#8C8275]">
                {t('lang.sheetTitle')}
              </p>
              <div className="pb-2">{options}</div>
            </motion.div>

            {/* ---------- desktop: anchored dropdown ---------- */}
            <motion.div
              key="menu"
              role="menu"
              id={menuId}
              aria-label={t('lang.label')}
              tabIndex={-1}
              onKeyDown={onMenuKeyDown}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className={[
                'absolute end-0 top-[calc(100%+8px)] z-[61] hidden sm:block',
                'w-[190px] overflow-hidden rounded-xl border border-[#E5E1D8] bg-[#FCFBF9]',
                'py-1 shadow-[0_14px_36px_rgba(34,31,27,0.14)]',
              ].join(' ')}
            >
              {options}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
