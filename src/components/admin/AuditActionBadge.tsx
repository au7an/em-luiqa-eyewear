import React from 'react';
import { AuditAction } from '../../types/database';

interface AuditActionBadgeProps {
  action: AuditAction | string;
  size?: 'sm' | 'md';
}

export const AuditActionBadge: React.FC<AuditActionBadgeProps> = ({ action, size = 'sm' }) => {
  const normAction = action.toUpperCase();

  let style = 'bg-neutral-100 text-neutral-700 border-neutral-200';

  switch (normAction) {
    case 'CREATE':
      style = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
      break;
    case 'UPDATE':
      style = 'bg-blue-50 text-blue-700 border-blue-200 font-semibold';
      break;
    case 'DELETE':
      style = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
      break;
    case 'PUBLISH':
      style = 'bg-purple-50 text-purple-700 border-purple-200 font-semibold';
      break;
    case 'UNPUBLISH':
      style = 'bg-neutral-100 text-neutral-600 border-neutral-300 font-medium';
      break;
    case 'ACTIVATE':
      style = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
      break;
    case 'DEACTIVATE':
      style = 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
      break;
    default:
      style = 'bg-neutral-100 text-neutral-700 border-neutral-200';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border tracking-wider uppercase select-none ${padding} ${style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      <span>{normAction}</span>
    </span>
  );
};
