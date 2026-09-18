import { create } from 'zustand';
import { ContactInquiry, InquiryStatus } from '../types/database';
import { getSupabaseClient } from '../lib/supabase';

const DEFAULT_INQUIRIES: ContactInquiry[] = [];

interface InquiryState {
  inquiries: ContactInquiry[];
  isLoading: boolean;
  error: string | null;

  loadInquiries: () => Promise<void>;
  submitInquiry: (inquiry: Omit<ContactInquiry, 'id' | 'created_at' | 'status'>) => Promise<{ success: boolean; error?: string }>;
  updateStatus: (id: string, status: InquiryStatus) => Promise<void>;
  deleteInquiry: (id: string) => Promise<{ success: boolean; error?: string }>;
  getNewCount: () => number;
}

export const useInquiryStore = create<InquiryState>((set, get) => ({
  inquiries: DEFAULT_INQUIRIES,
  isLoading: false,
  error: null,

  loadInquiries: async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ inquiries: DEFAULT_INQUIRIES, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        set({ inquiries: data, isLoading: false });
      } else {
        set({ inquiries: [], isLoading: false });
      }
    } catch (err: any) {
      console.warn('Failed to load inquiries from Supabase:', err);
      set({ error: err.message, isLoading: false });
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
      set({ inquiries: [newInquiry, ...get().inquiries] });
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
      set({ inquiries: [insertedInquiry, ...get().inquiries] });
      return { success: true };
    } catch (err: any) {
      console.error('Failed to submit inquiry to Supabase:', err);
      set({ inquiries: [newInquiry, ...get().inquiries] });
      return { success: true, error: err.message };
    }
  },

  updateStatus: async (id, status) => {
    const current = get().inquiries;
    const updated = current.map((inq) => (inq.id === id ? { ...inq, status } : inq));
    set({ inquiries: updated });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('inquiries').update({ status }).eq('id', id);
      } catch (err) {
        console.error('Failed to update inquiry status in Supabase:', err);
      }
    }
  },

  deleteInquiry: async (id) => {
    const current = get().inquiries;
    const filtered = current.filter((inq) => inq.id !== id);
    set({ inquiries: filtered });

    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase.from('inquiries').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      set({ inquiries: current });
      return { success: false, error: err.message };
    }
  },

  getNewCount: () => {
    return get().inquiries.filter((inq) => inq.status === 'New').length;
  },
}));
