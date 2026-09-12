import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  showBackButton?: boolean;
  action?: {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    to?: string;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
  };
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  showBackButton = false,
  action,
  children,
}) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-medium mb-3">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight size={12} className="text-neutral-300" />}
                {crumb.path && !isLast ? (
                  <Link to={crumb.path} className="hover:text-neutral-700 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'text-neutral-900 font-semibold' : ''}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Main Title & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 -ml-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={16} />
            </button>
          )}

          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-xs text-neutral-500 font-light mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {children}

          {action && action.to ? (
            <Link
              to={action.to}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
                action.variant === 'secondary'
                  ? 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white'
              }`}
            >
              {action.icon}
              <span>{action.label}</span>
            </Link>
          ) : action && action.onClick ? (
            <button
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 ${
                action.variant === 'secondary'
                  ? 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white'
              }`}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
