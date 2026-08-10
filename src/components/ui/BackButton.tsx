import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '../../i18n';

export interface BackButtonProps {
  /** Full label, e.g. "Back to Men's Collection". */
  label: string;
  /** Compact label for narrow screens, e.g. "Men's". */
  shortLabel?: string;
  onClick: () => void;
  /** `pill` = standalone control, `bar` = inside a page bar, `ghost` = on dark art. */
  tone?: 'pill' | 'bar' | 'ghost';
  className?: string;
}

/**
 * The universal "previous screen" control.
 */
export const BackButton: React.FC<BackButtonProps> = ({
  label,
  shortLabel,
  onClick,
  tone = 'pill',
  className = '',
}) => {
  const { t } = useI18n();
  const toneClass =
    tone === 'bar' ? 'btn-ghost' : tone === 'ghost' ? 'btn-ghost text-white/90 hover:text-white' : 'btn-secondary';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      data-tip={label}
      className={['btn btn-sm has-tip group', toneClass, className].filter(Boolean).join(' ')}
    >
      <ArrowLeft className="w-4 h-4 text-[#B8934A] transition-transform duration-300 group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{shortLabel ?? t('common.back')}</span>
    </button>
  );
};
