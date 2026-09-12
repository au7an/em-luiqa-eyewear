import { create } from 'zustand';

interface WishlistState {
  wishlistProductIds: string[];
  isOpen: boolean;

  openWishlist: () => void;
  closeWishlist: () => void;
  toggleWishlistDrawer: () => void;

  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WISHLIST_STORAGE_KEY = 'jem_luiqa_wishlist';

export const useWishlistStore = create<WishlistState>((set, get) => {
  const getSavedWishlist = (): string[] => {
    try {
      const data = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const saveWishlist = (ids: string[]) => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
    set({ wishlistProductIds: ids });
  };

  return {
    wishlistProductIds: getSavedWishlist(),
    isOpen: false,

    openWishlist: () => set({ isOpen: true }),
    closeWishlist: () => set({ isOpen: false }),
    toggleWishlistDrawer: () => set((state) => ({ isOpen: !state.isOpen })),

    toggleWishlist: (productId: string) => {
      const current = get().wishlistProductIds;
      if (current.includes(productId)) {
        saveWishlist(current.filter((id) => id !== productId));
      } else {
        saveWishlist([...current, productId]);
      }
    },

    isInWishlist: (productId: string) => {
      return get().wishlistProductIds.includes(productId);
    },

    clearWishlist: () => {
      saveWishlist([]);
    }
  };
});
