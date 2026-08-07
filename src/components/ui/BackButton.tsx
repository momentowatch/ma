import React from 'react';
import { ArrowLeft } from 'lucide-react';

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
 * It is rendered on every screen that has something behind it: the header,
 * the watch detail bar, and the header of every modal and drawer.
 */
export const BackButton: React.FC<BackButtonProps> = ({
  label,
  shortLabel,
  onClick,
  tone = 'pill',
  className = '',
}) => {
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
      <ArrowLeft className="w-4 h-4 text-[#B8934A] transition-transform duration-300 group-hover:-translate-x-0.5" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{shortLabel ?? 'Back'}</span>
    </button>
  );
};
