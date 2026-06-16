import { create } from 'zustand'
import { apiClient } from './authStore'

export const useTripStore = create((set, get) => ({
  destinations: [],
  bookmarks: [],
  trips: [],
  activeItinerary: null,
  loading: false,
  generating: false,
  error: null,

  fetchDestinations: async (state = '', category = '') => {
    set({ loading: true, error: null });
    try {
      let url = '/destinations';
      const params = [];
      if (state && state !== 'all') params.push(`state=${state}`);
      if (category && category !== 'all') params.push(`category=${category}`);
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const response = await apiClient.get(url);
      set({ destinations: response.data, loading: false });
    } catch (err) {
      set({ error: 'Failed to fetch destinations.', loading: false });
    }
  },

  fetchBookmarks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/users/bookmarks');
      set({ bookmarks: response.data, loading: false });
    } catch (err) {
      set({ error: 'Failed to load bookmarks.', loading: false });
    }
  },

  addBookmark: async (destId) => {
    try {
      await apiClient.post(`/users/bookmarks/${destId}`);
      // Refresh bookmarks list
      get().fetchBookmarks();
    } catch (err) {
      console.error('Failed to add bookmark', err);
    }
  },

  removeBookmark: async (destId) => {
    try {
      await apiClient.delete(`/users/bookmarks/${destId}`);
      // Refresh bookmarks list
      set((state) => ({
        bookmarks: state.bookmarks.filter((b) => b.id !== destId)
      }));
    } catch (err) {
      console.error('Failed to remove bookmark', err);
    }
  },

  fetchUserTrips: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/trips');
      set({ trips: response.data, loading: false });
    } catch (err) {
      set({ error: 'Failed to load saved trips.', loading: false });
    }
  },

  generateTrip: async (state, category, budget, duration) => {
    set({ generating: true, error: null, activeItinerary: null });
    try {
      const response = await apiClient.post('/trips', { state, category, budget, duration });
      const savedTrip = response.data;
      
      // Parse itinerary JSON string from backend
      const itineraryDetails = JSON.parse(savedTrip.itineraryJson);
      
      // Merge ID and total budget info
      const fullItinerary = {
        ...itineraryDetails,
        id: savedTrip.id,
        title: savedTrip.title,
        totalBudgetEstimate: savedTrip.totalBudgetEstimate,
        createdAt: savedTrip.createdAt
      };
      
      set({ 
        activeItinerary: fullItinerary, 
        generating: false 
      });
      
      // Refresh trips list
      get().fetchUserTrips();
      return fullItinerary;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Itinerary generation failed. Please verify auth session.';
      set({ error: errMsg, generating: false });
      throw new Error(errMsg);
    }
  },

  deleteTrip: async (tripId) => {
    try {
      await apiClient.delete(`/trips/${tripId}`);
      set((state) => ({
        trips: state.trips.filter((t) => t.id !== tripId)
      }));
      // Clear active Itinerary if deleted
      const active = get().activeItinerary;
      if (active && active.id === tripId) {
        set({ activeItinerary: null });
      }
    } catch (err) {
      console.error('Failed to delete trip', err);
    }
  },

  clearActiveItinerary: () => set({ activeItinerary: null })
}));
