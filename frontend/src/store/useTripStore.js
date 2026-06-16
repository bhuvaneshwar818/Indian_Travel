import { create } from 'zustand'
import { apiClient } from './authStore'

export const useTripStore = create((set, get) => ({
  preferences: {
    travelMode: 'SOLO',
    groupSize: 1,
    transportMode: 'PUBLIC',
    startLocation: ''
  },
  routeData: null,
  weatherData: {}, // key is city name
  transportData: [],
  expenses: [],
  expenseSummary: {
    totalSpent: 0,
    categoryBreakdown: {},
    perPersonSplit: 0,
    travelMode: 'SOLO',
    groupSize: 1
  },
  translationResult: '',
  loading: false,
  error: null,

  fetchPreferences: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/trip/preferences');
      set({ preferences: response.data, loading: false });
      return response.data;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to fetch preferences.', loading: false });
    }
  },

  savePreferences: async (prefs) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/trip/preferences', prefs);
      set({ preferences: response.data, loading: false });
      return response.data;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to save preferences.', loading: false });
      throw err;
    }
  },

  fetchShortestRoute: async (placeIds) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/route/shortest', { placeIds });
      set({ routeData: response.data, loading: false });
      return response.data;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to calculate shortest route.', loading: false });
    }
  },

  fetchScenicRoute: async (placeIds) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/route/scenic', { placeIds });
      set({ routeData: response.data, loading: false });
      return response.data;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to calculate scenic route.', loading: false });
    }
  },

  clearRouteData: () => set({ routeData: null }),

  fetchWeather: async (city) => {
    try {
      const response = await apiClient.get(`/weather?city=${city}`);
      set((state) => ({
        weatherData: {
          ...state.weatherData,
          [city.toLowerCase()]: response.data
        }
      }));
      return response.data;
    } catch (err) {
      console.error('Failed to fetch weather for ' + city, err);
    }
  },

  fetchTransportTimings: async (from, to) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get(`/transport/timings?from=${from}&to=${to}`);
      set({ transportData: response.data, loading: false });
      return response.data;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to fetch transport timings.', loading: false });
    }
  },

  fetchExpenses: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/expenses');
      set({ expenses: response.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to fetch expenses.', loading: false });
    }
  },

  addExpense: async (expense) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/expenses', expense);
      set((state) => ({
        expenses: [response.data, ...state.expenses],
        loading: false
      }));
      get().fetchExpenseSummary();
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to add expense.', loading: false });
      throw err;
    }
  },

  deleteExpense: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/expenses/${id}`);
      set((state) => ({
        expenses: state.expenses.filter((item) => item.id !== id),
        loading: false
      }));
      get().fetchExpenseSummary();
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to delete expense.', loading: false });
    }
  },

  fetchExpenseSummary: async () => {
    try {
      const response = await apiClient.get('/expenses/summary');
      set({ expenseSummary: response.data });
    } catch (err) {
      console.error('Failed to fetch expense summary', err);
    }
  },

  translateText: async (text, targetLang) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/translate', { text, targetLang });
      set({ translationResult: response.data.translatedText, loading: false });
      return response.data.translatedText;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to translate.', loading: false });
    }
  }
}));
