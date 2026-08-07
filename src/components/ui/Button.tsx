import React from 'react';

export type ButtonVariant =
  | 'primary'
  | 'gold'
  | 'secondary'
  | 'ghost'
  | 'whatsapp'
  | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  gold: 'btn-gold',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  whatsapp: 'btn-whatsapp',
  danger: 'btn-danger',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  /** Icon rendered before the label. */
  icon?: React.ReactNode;
  /** Icon rendered after the label. */
  iconRight?: React.ReactNode;
  /** Desktop tooltip. Defaults to the accessible name when the label is hidden. */
  tip?: string;
}

/**
 * The only button primitive in the app.
 * Guarantees: >=44px touch target, hover, :active press, focus ring, disabled.
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  block = false,
  icon,
  iconRight,
  tip,
  className = '',
  children,
  type = 'button',
  ...rest
}) => {
  const classes = [
    'btn',
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    block ? 'btn-block' : '',
    tip ? 'has-tip' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button type={type} className={classes} data-tip={tip} {...rest}>
      {icon}
      {children ? <span>{children}</span> : null}
      {iconRight}
    </button>
  );
};

export interface IconButtonProps extends Omit<ButtonProps, 'icon' | 'children'> {
  /** Mandatory: becomes aria-label, title and tooltip. */
  label: string;
  icon: React.ReactNode;
  /** Show the label as text next to the icon from the `sm` breakpoint up. */
  showLabel?: boolean;
  /** Small counter bubble (cart / wishlist). */
  badge?: number;
  badgeTone?: 'ink' | 'gold';
}

/**
 * Icon-only control. Never ambiguous: it always carries an accessible name,
 * a native title, and a hover tooltip, and it can reveal its text label on
 * wider screens.
 */
export const IconButton: React.FC<IconButtonProps> = ({
  label,
  icon,
  showLabel = false,
  badge,
  badgeTone = 'ink',
  variant = 'ghost',
  size = 'md',
  className = '',
  ...rest
}) => {
  const classes = [
    'btn',
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    showLabel ? '' : 'btn-icon',
    'has-tip relative',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classes}
      aria-label={label}
      title={label}
      data-tip={label}
      {...rest}
    >
      {icon}
      {showLabel ? <span className="hidden sm:inline">{label}</span> : null}
      {typeof badge === 'number' && badge > 0 ? (
        <span
          aria-hidden="true"
          className={
            'absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ' +
            'flex items-center justify-center shadow-sm ring-2 ring-[#FCFBF9] ' +
            (badgeTone === 'gold' ? 'bg-[#B8934A] text-white' : 'bg-[#221F1B] text-white')
          }
        >
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </button>
  );
};
