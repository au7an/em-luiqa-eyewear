import { create } from 'zustand';
import { getSupabaseClient } from '../lib/supabase';
import { AuditLogEntry, AuditLogFilters } from '../types/database';

interface AuditLogState {
  logs: AuditLogEntry[];
  totalCount: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  filters: AuditLogFilters;
  selectedLog: AuditLogEntry | null;
  recentActivities: AuditLogEntry[];
  isLoadingRecent: boolean;

  // Actions
  setFilters: (newFilters: Partial<AuditLogFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSelectedLog: (log: AuditLogEntry | null) => void;
  fetchLogs: () => Promise<void>;
  fetchRecentActivities: (limit?: number) => Promise<void>;
  exportToCsv: () => Promise<void>;
}

const defaultFilters: AuditLogFilters = {
  dateRange: 'all',
  startDate: '',
  endDate: '',
  action: '',
  entityType: '',
  userEmail: '',
  searchQuery: '',
};

export const useAuditLogStore = create<AuditLogState>((set, get) => ({
  logs: [],
  totalCount: 0,
  page: 1,
  pageSize: 20,
  isLoading: false,
  error: null,
  filters: { ...defaultFilters },
  selectedLog: null,
  recentActivities: [],
  isLoadingRecent: false,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      page: 1, // Reset to first page whenever filters change
    }));
    get().fetchLogs();
  },

  resetFilters: () => {
    set({ filters: { ...defaultFilters }, page: 1 });
    get().fetchLogs();
  },

  setPage: (page: number) => {
    set({ page });
    get().fetchLogs();
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize, page: 1 });
    get().fetchLogs();
  },

  setSelectedLog: (selectedLog: AuditLogEntry | null) => {
    set({ selectedLog });
  },

  fetchLogs: async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      set({
        logs: [],
        totalCount: 0,
        isLoading: false,
        error: 'Supabase client is not configured.',
      });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const { filters, page, pageSize } = get();

      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' });

      // Apply action filter
      if (filters.action && filters.action !== 'ALL') {
        query = query.eq('action', filters.action);
      }

      // Apply entity_type filter
      if (filters.entityType && filters.entityType !== 'ALL') {
        query = query.eq('entity_type', filters.entityType);
      }

      // Apply actor email filter
      if (filters.userEmail && filters.userEmail.trim()) {
        query = query.ilike('actor_email', `%${filters.userEmail.trim()}%`);
      }

      // Apply search query (target label or entity_id)
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const q = filters.searchQuery.trim();
        query = query.or(`entity_label.ilike.%${q}%,entity_id.ilike.%${q}%`);
      }

      // Apply date range filter
      const now = new Date();
      if (filters.dateRange === 'today') {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        query = query.gte('created_at', startOfDay);
      } else if (filters.dateRange === '7days') {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        query = query.gte('created_at', d.toISOString());
      } else if (filters.dateRange === '30days') {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        query = query.gte('created_at', d.toISOString());
      } else if (filters.dateRange === 'custom') {
        if (filters.startDate) {
          query = query.gte('created_at', new Date(filters.startDate).toISOString());
        }
        if (filters.endDate) {
          const end = new Date(filters.endDate);
          end.setHours(23, 59, 59, 999);
          query = query.lte('created_at', end.toISOString());
        }
      }

      // Pagination & Ordering
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        throw error;
      }

      console.log('[useAuditLogStore] Loaded audit logs:', data?.length, 'records, count:', count);

      set({
        logs: (data as AuditLogEntry[]) || [],
        totalCount: count ?? 0,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      console.error('Failed to fetch audit logs:', err);
      set({
        logs: [],
        totalCount: 0,
        isLoading: false,
        error: err.message || 'Failed to load audit logs.',
      });
    }
  },

  fetchRecentActivities: async (limit = 6) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      set({ isLoadingRecent: true });
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      set({
        recentActivities: (data as AuditLogEntry[]) || [],
        isLoadingRecent: false,
      });
    } catch (err) {
      console.warn('Could not load recent activities for dashboard:', err);
      set({ isLoadingRecent: false });
    }
  },

  exportToCsv: async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { filters } = get();

      let query = supabase.from('audit_logs').select('*');

      if (filters.action && filters.action !== 'ALL') {
        query = query.eq('action', filters.action);
      }
      if (filters.entityType && filters.entityType !== 'ALL') {
        query = query.eq('entity_type', filters.entityType);
      }
      if (filters.userEmail && filters.userEmail.trim()) {
        query = query.ilike('actor_email', `%${filters.userEmail.trim()}%`);
      }
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const q = filters.searchQuery.trim();
        query = query.or(`entity_label.ilike.%${q}%,entity_id.ilike.%${q}%`);
      }

      const now = new Date();
      if (filters.dateRange === 'today') {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        query = query.gte('created_at', startOfDay);
      } else if (filters.dateRange === '7days') {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        query = query.gte('created_at', d.toISOString());
      } else if (filters.dateRange === '30days') {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        query = query.gte('created_at', d.toISOString());
      } else if (filters.dateRange === 'custom') {
        if (filters.startDate) {
          query = query.gte('created_at', new Date(filters.startDate).toISOString());
        }
        if (filters.endDate) {
          const end = new Date(filters.endDate);
          end.setHours(23, 59, 59, 999);
          query = query.lte('created_at', end.toISOString());
        }
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(5000);

      if (error) throw error;
      if (!data || data.length === 0) {
        alert('No records found for the selected filters to export.');
        return;
      }

      const summarizeChanges = (entry: AuditLogEntry): string => {
        if (entry.action === 'CREATE') {
          return 'New record created';
        }
        if (entry.action === 'DELETE') {
          return 'Record removed';
        }
        if (entry.before_data && entry.after_data) {
          const changed: string[] = [];
          const allKeys = Array.from(
            new Set([...Object.keys(entry.before_data), ...Object.keys(entry.after_data)])
          );
          for (const key of allKeys) {
            if (key === 'updated_at' || key === 'created_at') continue;
            const bVal = JSON.stringify(entry.before_data[key]);
            const aVal = JSON.stringify(entry.after_data[key]);
            if (bVal !== aVal) {
              changed.push(`${key}: ${bVal ?? 'null'} -> ${aVal ?? 'null'}`);
            }
          }
          return changed.slice(0, 5).join(' | ') + (changed.length > 5 ? ` (+${changed.length - 5} more)` : '');
        }
        return '';
      };

      const headers = ['Timestamp', 'Action', 'Entity Type', 'Target', 'User Email', 'Changed Fields Summary'];
      const csvRows = [headers.join(',')];

      for (const row of data as AuditLogEntry[]) {
        const ts = new Date(row.created_at).toLocaleString('id-ID');
        const action = row.action;
        const entityType = row.entity_type;
        const target = (row.entity_label || row.entity_id || '').replace(/"/g, '""');
        const email = (row.actor_email || 'system').replace(/"/g, '""');
        const summary = summarizeChanges(row).replace(/"/g, '""');

        csvRows.push(
          `"${ts}","${action}","${entityType}","${target}","${email}","${summary}"`
        );
      }

      const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
      const link = document.createElement('a');
      link.setAttribute('href', csvContent);
      link.setAttribute('download', `jemluiqa-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error('Failed to export CSV:', err);
      alert('Failed to export audit logs: ' + (err.message || 'Unknown error'));
    }
  },
}));
