import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'dark' | 'glass';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wider uppercase transition-all";
  
  const variants = {
    default: "bg-black/5 text-black border border-black/10",
    outline: "border border-neutral-300 text-neutral-800",
    dark: "bg-black text-white border border-black",
    glass: "bg-white/80 backdrop-blur-md text-black border border-white/60 shadow-sm",
  };

  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
