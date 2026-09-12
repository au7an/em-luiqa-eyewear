import { create } from 'zustand';
import { Product } from '../types/product';

interface UIState {
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  quickviewProduct: Product | null;
  lightboxImage: { src: string; caption?: string; title?: string } | null;

  openSearch: () => void;
  closeSearch: () => void;
  
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;

  openQuickview: (product: Product) => void;
  closeQuickview: () => void;

  openLightbox: (image: { src: string; caption?: string; title?: string }) => void;
  closeLightbox: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSearchOpen: false,
  isMobileMenuOpen: false,
  quickviewProduct: null,
  lightboxImage: null,

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),

  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  openQuickview: (product) => set({ quickviewProduct: product }),
  closeQuickview: () => set({ quickviewProduct: null }),

  openLightbox: (image) => set({ lightboxImage: image }),
  closeLightbox: () => set({ lightboxImage: null }),
}));
