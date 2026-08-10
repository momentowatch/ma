import React, { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowLeft } from 'lucide-react';
import { useI18n } from '../../i18n';

export interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  /** Visible dialog title. */
  title: string;
  subtitle?: string;
  /** Small mark rendered left of the title. */
  icon?: React.ReactNode;
  /** `center` = dialog, `drawer` = right-hand sheet. */
  layout?: 'center' | 'drawer';
  /** Tailwind max-width class for the centred layout. */
  maxWidthClass?: string;
  /** Optional secondary navigation inside the dialog. */
  onBack?: () => void;
  backLabel?: string;
  /** Sticky footer area. */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const ModalShell: React.FC<ModalShellProps> = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  layout = 'center',
  maxWidthClass = 'max-w-lg',
  onBack,
  backLabel,
  footer,
  children,
}) => {
  const { isRtl, t } = useI18n();
  const panelRef = useRef<HTMLDivElement | null>(null);

  const effectiveBackLabel = backLabel ?? t('common.back');

  // Escape closes, Tab stays inside.
  const onKeyDown = useCallback((event: KeyboardEvent) => {
    if (!open) return;
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab' || !panelRef.current) return;
    const focusables = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', onKeyDown, true);
    document.body.classList.add('scroll-lock');
    const timer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    }, 60);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.classList.remove('scroll-lock');
      window.clearTimeout(timer);
    };
  }, [open, onKeyDown]);

  const isDrawer = layout === 'drawer';

  return (
    <AnimatePresence>
      {open && (
        <div
          className={
            'fixed inset-0 z-50 flex overflow-x-hidden ' +
            (isDrawer ? 'justify-end' : 'items-center justify-center p-3 sm:p-6 overflow-y-auto')
          }
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#221F1B]/45 backdrop-blur-md"
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={isDrawer ? { x: isRtl ? '-100%' : '100%' } : { opacity: 0, y: 18, scale: 0.985 }}
            animate={isDrawer ? { x: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={isDrawer ? { x: isRtl ? '-100%' : '100%' } : { opacity: 0, y: 12, scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 320, damping: 34, mass: 0.7 }}
            className={
              'relative bg-[#FCFBF9] flex flex-col overflow-x-hidden ' +
              (isDrawer
                ? 'w-full max-w-md h-full drawer-shell border-s border-[#E8E2D5]'
                : 'w-full ' + maxWidthClass + ' modal-shell max-h-[92vh] my-auto')
            }
          >
            {/* Header: back (optional) + title + labelled close */}
            <div className="shrink-0 flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-[#E8E2D5] bg-white/70 backdrop-blur-md">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  aria-label={effectiveBackLabel}
                  title={effectiveBackLabel}
                  data-tip={effectiveBackLabel}
                  className="btn btn-sm btn-ghost btn-icon has-tip"
                >
                  <ArrowLeft className="w-4 h-4 text-[#B8934A] rtl:rotate-180" />
                </button>
              )}

              <div className="min-w-0 flex-1 flex items-center gap-2.5">
                {icon}
                <div className="min-w-0">
                  <h2 className="font-serif-luxury text-lg sm:text-xl font-light text-[#221F1B] leading-tight truncate">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-[#8C8275] truncate">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label={t('common.close')}
                title={t('common.close')}
                className="btn btn-sm btn-secondary shrink-0"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">{t('common.close')}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">{children}</div>

            {footer && (
              <div className="shrink-0 border-t border-[#E8E2D5] bg-white/80 backdrop-blur-md px-4 sm:px-6 py-4 space-y-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
