import React from 'react';
import { StockStatus, InquiryStatus } from '../../types/database';

interface StatusBadgeProps {
  status: StockStatus | InquiryStatus | 'Published' | 'Draft' | 'Active' | 'Inactive' | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  let style = 'bg-neutral-100 text-neutral-700 border-neutral-200';

  switch (status) {
    case 'Published':
    case 'Active':
    case 'Available':
    case 'Completed':
      style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'Draft':
    case 'Inactive':
    case 'Closed':
      style = 'bg-neutral-100 text-neutral-600 border-neutral-200';
      break;
    case 'Low Stock':
    case 'Read':
    case 'In Production':
      style = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'Sold Out':
    case 'Canceled':
      style = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    case 'Coming Soon':
    case 'Replied':
    case 'Contacted':
      style = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'New':
      style = 'bg-violet-50 text-violet-700 border-violet-200 font-semibold';
      break;
    default:
      style = 'bg-neutral-100 text-neutral-700 border-neutral-200';
  }

  const padding = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${padding} ${style} tracking-wide select-none`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      <span>{status}</span>
    </span>
  );
};
