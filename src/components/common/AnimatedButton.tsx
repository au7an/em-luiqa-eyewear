import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export type AnimatedButtonVariant =
  | 'dark'
  | 'light'
  | 'outline-white'
  | 'outline-dark'
  | 'emerald'
  | 'none';

export type AnimatedButtonSize = 'sm' | 'md' | 'lg' | 'none';

interface AnimatedButtonBaseProps {
  children: React.ReactNode;
  variant?: AnimatedButtonVariant;
  size?: AnimatedButtonSize;
  className?: string;
  overlayClassName?: string;
  overlayTextClassName?: string;
  disabled?: boolean;
}

type ButtonAsButton = AnimatedButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof AnimatedButtonBaseProps> & {
    to?: undefined;
    href?: undefined;
  };

type ButtonAsLink = AnimatedButtonBaseProps & {
  to: string;
  href?: undefined;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof AnimatedButtonBaseProps | 'href'>;

type ButtonAsAnchor = AnimatedButtonBaseProps & {
  href: string;
  to?: undefined;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof AnimatedButtonBaseProps>;

export type AnimatedButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor;

const variantStyles: Record<
  AnimatedButtonVariant,
  {
    base: string;
    text: string;
    overlay: string;
    overlayText: string;
  }
> = {
  dark: {
    base: 'bg-neutral-900 text-white border border-neutral-900',
    text: 'text-white',
    overlay: 'bg-white',
    overlayText: 'text-neutral-950 font-semibold',
  },
  light: {
    base: 'bg-white text-neutral-900 border border-neutral-200 shadow-sm',
    text: 'text-neutral-900 font-semibold',
    overlay: 'bg-neutral-900',
    overlayText: 'text-white font-semibold',
  },
  'outline-white': {
    base: 'border border-white/75 bg-white/10 text-white backdrop-blur-xs shadow-sm',
    text: 'text-white font-normal',
    overlay: 'bg-white',
    overlayText: 'text-neutral-950 font-semibold',
  },
  'outline-dark': {
    base: 'border border-neutral-300 bg-white text-neutral-900',
    text: 'text-neutral-900 font-semibold',
    overlay: 'bg-neutral-900',
    overlayText: 'text-white font-semibold',
  },
  emerald: {
    base: 'bg-emerald-700 text-white shadow-sm border border-emerald-700',
    text: 'text-white font-semibold',
    overlay: 'bg-neutral-950',
    overlayText: 'text-white font-semibold',
  },
  none: {
    base: '',
    text: '',
    overlay: 'bg-neutral-900',
    overlayText: 'text-white',
  },
};

const sizeStyles: Record<AnimatedButtonSize, string> = {
  sm: 'px-4 py-2 text-xs tracking-wider uppercase',
  md: 'px-6 py-3 text-xs tracking-wider uppercase',
  lg: 'px-8 py-3.5 text-sm tracking-wider uppercase',
  none: '',
};

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = 'dark',
  size = 'none',
  className,
  overlayClassName,
  overlayTextClassName,
  disabled,
  ...rest
}) => {
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  const commonClasses = cn(
    'group relative inline-flex items-center justify-center overflow-hidden cursor-pointer select-none transition-transform duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
    v.base,
    s,
    className
  );

  // Precision stationary content:
  // Base layer is placed in the normal flow.
  // Overlay container slides up from bottom (translate-y-full -> translate-y-0).
  // Inside the overlay container, inner content counter-translates (-translate-y-full -> translate-y-0).
  // This keeps the text in the exact stationary position while the background reveals from bottom.
  const innerContent = (
    <>
      {/* Stationary Base Text */}
      <span
        className={cn(
          'relative z-0 inline-flex items-center justify-center gap-2 text-center',
          v.text
        )}
      >
        {children}
      </span>

      {/* Reveal Fill Layer with Counter-Translation */}
      <div
        className={cn(
          'absolute inset-0 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out overflow-hidden pointer-events-none',
          v.overlay,
          overlayClassName
        )}
        aria-hidden="true"
      >
        <div className="w-full h-full flex items-center justify-center -translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <span
            className={cn(
              'inline-flex items-center justify-center gap-2 text-center',
              v.overlayText,
              overlayTextClassName
            )}
          >
            {children}
          </span>
        </div>
      </div>
    </>
  );

  if ('to' in rest && rest.to) {
    const { to, ...linkRest } = rest as ButtonAsLink;
    return (
      <Link to={to} className={commonClasses} {...linkRest}>
        {innerContent}
      </Link>
    );
  }

  if ('href' in rest && rest.href) {
    const { href, ...anchorRest } = rest as ButtonAsAnchor;
    return (
      <a href={href} className={commonClasses} {...anchorRest}>
        {innerContent}
      </a>
    );
  }

  const { type = 'button', ...buttonRest } = rest as ButtonAsButton;
  return (
    <button type={type} disabled={disabled} className={commonClasses} {...buttonRest}>
      {innerContent}
    </button>
  );
};
