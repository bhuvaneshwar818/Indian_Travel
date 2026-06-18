import { create } from 'zustand'
import { apiClient } from './authStore'

export const useWishlistStore = create((set, get) => ({
  wishlist: [],
  loading: false,
  error: null,

  fetchWishlist: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/wishlist');
      set({ wishlist: response.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to fetch wishlist.', loading: false });
    }
  },

  addPlaceToWishlist: async (placeName, state, category, lat, lng) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/wishlist', {
        placeName,
        state,
        category,
        lat,
        lng
      });
      set((stateObj) => ({
        wishlist: [...stateObj.wishlist, response.data],
        loading: false
      }));
      return response.data;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to add place to wishlist.', loading: false });
      throw err;
    }
  },

  removePlaceFromWishlist: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/wishlist/${id}`);
      set((stateObj) => ({
        wishlist: stateObj.wishlist.filter((item) => item.id !== id),
        loading: false
      }));
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to remove item.', loading: false });
    }
  },

  reorderWishlist: async (reorderedItems) => {
    // Optimistically set state
    set({ wishlist: reorderedItems });
    try {
      const ids = reorderedItems.map((item) => item.id);
      await apiClient.put('/wishlist/reorder', ids);
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to save wishlist sorting.' });
      // Re-fetch to sync
      get().fetchWishlist();
    }
  },

  updatePlaceName: async (id, newName) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.put(`/wishlist/${id}`, { placeName: newName });
      set((stateObj) => ({
        wishlist: stateObj.wishlist.map((item) => item.id === id ? response.data : item),
        loading: false
      }));
      return response.data;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to update place name.', loading: false });
      throw err;
    }
  }
}));
