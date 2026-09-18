import React, { useEffect, useState } from 'react';
import {
  Download,
  Filter,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { DataTable, Column } from '../../components/admin/DataTable';
import { EmptyState } from '../../components/admin/EmptyState';
import { AuditActionBadge } from '../../components/admin/AuditActionBadge';
import { AuditDetailDrawer } from '../../components/admin/AuditDetailDrawer';
import { useAuditLogStore } from '../../store/useAuditLogStore';
import { AuditLogEntry, AuditDateRangePreset } from '../../types/database';

export const AdminActivityPage: React.FC = () => {
  const {
    logs,
    totalCount,
    page,
    pageSize,
    isLoading,
    error,
    filters,
    selectedLog,
    setFilters,
    resetFilters,
    setPage,
    setPageSize,
    setSelectedLog,
    fetchLogs,
    exportToCsv,
  } = useAuditLogStore();

  const [isExporting, setIsExporting] = useState(false);
  const [showCustomDates, setShowCustomDates] = useState(filters.dateRange === 'custom');

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    await exportToCsv();
    setIsExporting(false);
  };

  const handleDatePresetChange = (preset: AuditDateRangePreset) => {
    setShowCustomDates(preset === 'custom');
    setFilters({
      dateRange: preset,
      startDate: preset === 'custom' ? filters.startDate : '',
      endDate: preset === 'custom' ? filters.endDate : '',
    });
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const formatTimestamp = (isoDate: string) => {
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
  };

  const formatEntityTypeName = (type: string) => {
    switch (type) {
      case 'products':
        return 'PRODUCT';
      case 'product_variants':
        return 'VARIANT';
      case 'product_images':
        return 'IMAGE';
      case 'campaigns':
        return 'CAMPAIGN';
      case 'lens_services':
        return 'LENS SERVICE';
      case 'promotions':
        return 'PROMOTION';
      case 'lookbook_collections':
        return 'LOOKBOOK';
      case 'lookbook_media':
        return 'LOOKBOOK MEDIA';
      case 'site_settings':
        return 'SETTINGS';
      default:
        return type.replace(/_/g, ' ').toUpperCase();
    }
  };

  const columns: Column<AuditLogEntry>[] = [
    {
      header: 'WAKTU',
      accessorKey: 'created_at',
      className: 'w-[180px] font-mono text-[11px] text-neutral-600',
      render: (row) => (
        <span className="font-mono text-neutral-700 font-medium">
          {formatTimestamp(row.created_at)}
        </span>
      ),
    },
    {
      header: 'AKSI',
      accessorKey: 'action',
      className: 'w-[160px]',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <AuditActionBadge action={row.action} size="sm" />
        </div>
      ),
    },
    {
      header: 'TARGET DATA',
      accessorKey: 'entity_label',
      className: 'min-w-[240px]',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">
              {formatEntityTypeName(row.entity_type)}
            </span>
            {row.action === 'UPDATE' && row.before_data && row.after_data && (
              <span className="text-[9px] text-neutral-400 font-normal">
                (Click to view diff)
              </span>
            )}
          </div>
          <div className="font-semibold text-neutral-900 tracking-tight text-xs">
            {row.entity_label || row.entity_id || '—'}
          </div>
        </div>
      ),
    },
    {
      header: 'USER EMAIL',
      accessorKey: 'actor_email',
      className: 'min-w-[200px] text-neutral-700',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-neutral-600 font-medium">
          <span className="text-neutral-400">@</span>
          <span className="truncate max-w-[220px]">
            {row.actor_email || 'system'}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="SECURITY AUDIT LOGS"
        description="Riwayat aktivitas perubahan data oleh admin."
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLogs()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
            title="Refresh logs"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={isExporting || totalCount === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={13} />
            <span>{isExporting ? 'Exporting...' : 'Download CSV'}</span>
          </button>
        </div>
      </PageHeader>

      {/* Notice / Warning if database table is not migrated yet or query failed */}
      {error && (
        <div className="p-5 rounded-2xl border border-amber-300 bg-amber-50 text-amber-900 text-xs shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-amber-950">
                  Database Table Setup Required
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-200/80 text-amber-800 font-mono text-[10px] font-semibold">
                  public.audit_logs
                </span>
              </div>

              <p className="text-amber-800 leading-relaxed">
                The Security Audit Log system uses PostgreSQL triggers and an append-only <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">public.audit_logs</code> table. The table has not been created on your Supabase project yet.
              </p>

              <div className="bg-white/80 p-3 rounded-xl border border-amber-200 space-y-1.5 text-neutral-800">
                <span className="font-semibold block text-neutral-900">
                  Quick 1-Minute Activation Steps:
                </span>
                <ol className="list-decimal list-inside space-y-1 text-neutral-700 text-[11px]">
                  <li>
                    Open your <strong>Supabase Dashboard</strong> → <strong>SQL Editor</strong>.
                  </li>
                  <li>
                    Copy and run the contents of:{' '}
                    <code className="bg-neutral-100 px-1.5 py-0.5 rounded font-mono text-neutral-900 select-all">
                      supabase/migration_add_security_audit_logs.sql
                    </code>
                  </li>
                  <li>
                    Click the <strong>Refresh</strong> button above to start viewing live audit logs.
                  </li>
                </ol>
              </div>

              <div className="pt-1 flex items-center gap-3">
                <button
                  onClick={() => fetchLogs()}
                  className="px-3 py-1.5 rounded-lg bg-amber-900 text-white font-semibold hover:bg-amber-800 transition-colors inline-flex items-center gap-1.5"
                >
                  <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                  <span>Check Table Again</span>
                </button>
                <span className="text-[11px] text-amber-700">
                  Exact error: {error}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
            <Filter size={13} />
            <span>Filters & Controls</span>
          </div>

          <button
            onClick={resetFilters}
            className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Reset Filters
          </button>
        </div>

        {/* Main Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search target or ID..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ searchQuery: e.target.value })}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50/50 text-xs text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors"
            />
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ action: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50/50 text-xs text-neutral-800 focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors"
            >
              <option value="">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="PUBLISH">PUBLISH</option>
              <option value="UNPUBLISH">UNPUBLISH</option>
              <option value="ACTIVATE">ACTIVATE</option>
              <option value="DEACTIVATE">DEACTIVATE</option>
            </select>
          </div>

          {/* Module / Entity Filter */}
          <div>
            <select
              value={filters.entityType}
              onChange={(e) => setFilters({ entityType: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50/50 text-xs text-neutral-800 focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors"
            >
              <option value="">All Modules</option>
              <option value="products">Products</option>
              <option value="product_variants">Product Variants</option>
              <option value="product_images">Product Images</option>
              <option value="campaigns">Campaigns</option>
              <option value="lens_services">Lens Services</option>
              <option value="promotions">Promotions</option>
              <option value="lookbook_collections">Lookbook Collections</option>
              <option value="lookbook_media">Lookbook Media</option>
              <option value="site_settings">Site Settings</option>
            </select>
          </div>

          {/* Date Range Preset Filter */}
          <div>
            <select
              value={filters.dateRange}
              onChange={(e) => handleDatePresetChange(e.target.value as AuditDateRangePreset)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50/50 text-xs text-neutral-800 focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="custom">Custom Date Range...</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Picker Row */}
        {showCustomDates && (
          <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 font-medium">From:</span>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => setFilters({ startDate: e.target.value })}
                className="px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 font-medium">To:</span>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => setFilters({ endDate: e.target.value })}
                className="px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={logs}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        onRowClick={(row) => setSelectedLog(row)}
        emptyState={
          <EmptyState
            icon={ShieldCheck}
            title="No audit activity records found"
            description="Mutations performed by admins on products, campaigns, or settings will automatically appear here."
            actionLabel="Refresh Records"
            onAction={() => fetchLogs()}
          />
        }
      />

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-600 shadow-2xs">
        <div className="flex items-center gap-3">
          <span>
            Showing <strong className="text-neutral-900">{logs.length}</strong> of{' '}
            <strong className="text-neutral-900">{totalCount}</strong> entries
          </span>

          <div className="flex items-center gap-1.5 pl-3 border-l border-neutral-200">
            <span className="text-neutral-500">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 rounded border border-neutral-200 text-xs font-semibold focus:outline-none"
            >
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-neutral-500">
            Page <strong className="text-neutral-900">{page}</strong> of{' '}
            <strong className="text-neutral-900">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1 || isLoading}
              className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages || isLoading}
              className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      <AuditDetailDrawer
        entry={selectedLog}
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
};
