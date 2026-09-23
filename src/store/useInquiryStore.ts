import { create } from 'zustand';
import { ContactInquiry, InquiryStatus } from '../types/database';
import { getSupabaseClient } from '../lib/supabase';

const STORAGE_KEY = 'jem_luiqa_inquiries_cache';
const STATUS_OVERRIDES_KEY = 'jem_luiqa_inquiry_status_map';

/**
 * Read cached inquiries from localStorage for instant display and offline resilience
 */
function getStoredInquiries(): ContactInquiry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse inquiries from localStorage:', e);
    return [];
  }
}

/**
 * Persist inquiries list to localStorage
 */
function saveStoredInquiries(inquiries: ContactInquiry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inquiries));
  } catch (e) {
    console.error('Failed to save inquiries to localStorage:', e);
  }
}

/**
 * Read status overrides map from localStorage
 */
function getStoredStatusOverrides(): Record<string, InquiryStatus> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STATUS_OVERRIDES_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Save an inquiry status override to localStorage
 */
function saveStoredStatusOverride(id: string, status: InquiryStatus): void {
  if (typeof window === 'undefined') return;
  try {
    const map = getStoredStatusOverrides();
    map[id] = status;
    localStorage.setItem(STATUS_OVERRIDES_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save status override to localStorage:', e);
  }
}

/**
 * Remove status override from localStorage when inquiry is deleted
 */
function removeStoredStatusOverride(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const map = getStoredStatusOverrides();
    delete map[id];
    localStorage.setItem(STATUS_OVERRIDES_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to remove status override from localStorage:', e);
  }
}

interface InquiryState {
  inquiries: ContactInquiry[];
  isLoading: boolean;
  error: string | null;

  loadInquiries: () => Promise<void>;
  submitInquiry: (inquiry: Omit<ContactInquiry, 'id' | 'created_at' | 'status'>) => Promise<{ success: boolean; error?: string }>;
  updateStatus: (id: string, status: InquiryStatus) => Promise<{ success: boolean; error?: string; synced: boolean }>;
  deleteInquiry: (id: string) => Promise<{ success: boolean; error?: string }>;
  getNewCount: () => number;
}

export const useInquiryStore = create<InquiryState>((set, get) => ({
  inquiries: getStoredInquiries(),
  isLoading: false,
  error: null,

  loadInquiries: async () => {
    const supabase = getSupabaseClient();
    const localInquiries = getStoredInquiries();
    const statusOverrides = getStoredStatusOverrides();

    if (!supabase) {
      set({ inquiries: localInquiries, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Failed to load inquiries from Supabase, preserving local cache:', error.message);
        set({ inquiries: localInquiries, isLoading: false, error: error.message });
        return;
      }

      if (data && data.length > 0) {
        // Reconcile server data with local status overrides to prevent reverting
        const reconciledServerData: ContactInquiry[] = data.map((serverInq) => {
          if (statusOverrides[serverInq.id]) {
            return {
              ...serverInq,
              status: statusOverrides[serverInq.id],
            };
          }
          return serverInq;
        });

        // Also retain any local-only inquiries (created offline or client-only fallback)
        const localOnly = localInquiries.filter(
          (loc) => loc.id.startsWith('inq-') && !reconciledServerData.some((srv) => srv.id === loc.id)
        );

        const merged = [...localOnly, ...reconciledServerData];
        set({ inquiries: merged, isLoading: false });
        saveStoredInquiries(merged);
      } else if (localInquiries.length > 0) {
        // If Supabase returned empty (e.g. RLS blocks anon SELECT or table empty), preserve local cache
        set({ inquiries: localInquiries, isLoading: false });
      } else {
        set({ inquiries: [], isLoading: false });
        saveStoredInquiries([]);
      }
    } catch (err: any) {
      console.warn('Failed to load inquiries from Supabase:', err);
      set({ inquiries: localInquiries, error: err.message, isLoading: false });
    }
  },

  submitInquiry: async (inquiryData) => {
    const newInquiry: ContactInquiry = {
      ...inquiryData,
      id: `inq-${Date.now()}`,
      status: 'New',
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (!supabase) {
      const updated = [newInquiry, ...get().inquiries];
      set({ inquiries: updated });
      saveStoredInquiries(updated);
      return { success: true };
    }

    try {
      const insertPayload: Record<string, any> = {
        name: inquiryData.name,
        email: inquiryData.email || null,
        phone: inquiryData.phone || null,
        subject: inquiryData.subject || 'Custom Lens Order',
        message: inquiryData.message,
        status: 'New',
      };

      if (inquiryData.product_id) insertPayload.product_id = inquiryData.product_id;
      if (inquiryData.product_name) insertPayload.product_name = inquiryData.product_name;
      if (inquiryData.variant_name) insertPayload.variant_name = inquiryData.variant_name;
      if (inquiryData.variant_sku) insertPayload.variant_sku = inquiryData.variant_sku;
      if (inquiryData.variant_color_hex) insertPayload.variant_color_hex = inquiryData.variant_color_hex;
      if (inquiryData.prescription_file_url) insertPayload.prescription_file_url = inquiryData.prescription_file_url;
      if (inquiryData.prescription_file_name) insertPayload.prescription_file_name = inquiryData.prescription_file_name;
      if (inquiryData.custom_lens_data) insertPayload.custom_lens_data = inquiryData.custom_lens_data;
      if (inquiryData.total_price) insertPayload.total_price = inquiryData.total_price;

      let { data, error } = await supabase.from('inquiries').insert([insertPayload]).select().single();

      if (error && (error.code === '42703' || error.message.includes('column'))) {
        console.warn('Extended columns missing in public.inquiries, falling back to basic columns:', error.message);
        const details = [
          `Product: ${inquiryData.product_name || '-'}`,
          `Total: ${inquiryData.total_price || '-'}`,
        ];
        if (inquiryData.prescription_file_url) {
          details.push(`Prescription File: ${inquiryData.prescription_file_url}`);
        }
        const fallbackPayload = {
          name: inquiryData.name,
          email: inquiryData.email || 'customer@jemluiqa.com',
          phone: inquiryData.phone || null,
          subject: inquiryData.subject || 'Custom Lens Order',
          message: `${inquiryData.message}\n\n[Order Details]\n${details.join('\n')}`,
          status: 'New',
        };
        const fallbackRes = await supabase.from('inquiries').insert([fallbackPayload]).select().single();
        if (fallbackRes.error) throw fallbackRes.error;
        data = fallbackRes.data;
      } else if (error) {
        throw error;
      }

      const insertedInquiry: ContactInquiry = data || newInquiry;
      const updated = [insertedInquiry, ...get().inquiries];
      set({ inquiries: updated });
      saveStoredInquiries(updated);
      return { success: true };
    } catch (err: any) {
      console.warn('Failed to submit inquiry to Supabase, saved to local cache:', err);
      const updated = [newInquiry, ...get().inquiries];
      set({ inquiries: updated });
      saveStoredInquiries(updated);
      return { success: true, error: err.message };
    }
  },

  updateStatus: async (id, status) => {
    // 1. Optimistic update in Zustand & persist to LocalStorage immediately
    const current = get().inquiries;
    const updated = current.map((inq) => (inq.id === id ? { ...inq, status } : inq));
    set({ inquiries: updated });
    saveStoredInquiries(updated);
    saveStoredStatusOverride(id, status);

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: true, synced: false };
    }

    // 2. Sync to Supabase if row exists in remote DB
    try {
      const { error } = await supabase.from('inquiries').update({ status }).eq('id', id);
      if (error) {
        console.warn('Supabase status update failed (preserved locally):', error.message);
        return { success: true, synced: false, error: error.message };
      }
      return { success: true, synced: true };
    } catch (err: any) {
      console.warn('Supabase status update exception (preserved locally):', err);
      return { success: true, synced: false, error: err.message };
    }
  },

  deleteInquiry: async (id) => {
    const current = get().inquiries;
    const filtered = current.filter((inq) => inq.id !== id);
    set({ inquiries: filtered });
    saveStoredInquiries(filtered);
    removeStoredStatusOverride(id);

    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase.from('inquiries').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.warn('Supabase delete error (handled locally):', err.message);
      return { success: true, error: err.message };
    }
  },

  getNewCount: () => {
    return get().inquiries.filter((inq) => inq.status === 'New' || inq.status === 'Read').length;
  },
}));
