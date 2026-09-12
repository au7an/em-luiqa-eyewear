import { create } from 'zustand';
import { ContactInquiry, InquiryStatus } from '../types/database';
import { getSupabaseClient } from '../lib/supabase';

const DEFAULT_INQUIRIES: ContactInquiry[] = [
  {
    id: 'inq-01',
    name: 'Amanda V.',
    email: 'amanda.v@example.com',
    phone: '+6281987654321',
    subject: 'Prescription Lens Customization',
    message: 'Halo, apakah frame CERVULA 01 bisa dipasangkan lensa minus tinggi (-4.50 silinder -1.0) dengan index 1.67 tipis?',
    status: 'New',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'inq-02',
    name: 'Reza Pratama',
    email: 'reza.p@example.com',
    phone: '+6281122334455',
    subject: 'Custom Studio Fitting Appointment',
    message: 'Saya ingin konsultasi fitting frame langsung untuk model ANAK JUJUR 02 di Bandung studio.',
    status: 'Read',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
  {
    id: 'inq-03',
    name: 'Devina S.',
    email: 'devina.s@example.com',
    phone: '+6281334455667',
    subject: 'Blue Chromic Lens Details',
    message: 'Apakah lensa Blue Chromic bisa dipasang ke model sunglasses Amber Shades 04?',
    status: 'Replied',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
];

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

      if (data && data.length > 0) {
        set({ inquiries: data, isLoading: false });
      } else {
        set({ inquiries: DEFAULT_INQUIRIES, isLoading: false });
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
      const { error } = await supabase.from('inquiries').insert([
        {
          name: inquiryData.name,
          email: inquiryData.email,
          phone: inquiryData.phone,
          subject: inquiryData.subject,
          message: inquiryData.message,
          status: 'New',
        },
      ]);

      if (error) throw error;

      set({ inquiries: [newInquiry, ...get().inquiries] });
      return { success: true };
    } catch (err: any) {
      console.error('Failed to submit inquiry to Supabase:', err);
      return { success: false, error: err.message || 'Failed to send inquiry.' };
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
