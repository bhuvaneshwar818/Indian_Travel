import { create } from 'zustand'
import axios from 'axios'
import { supabase } from '../lib/supabaseClient'

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api';

// Create configured Axios instance
export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Send cookies automatically with every request
  headers: {
    'Content-Type': 'application/json',
  }
});

// Configure request interceptor to auto-inject Bearer tokens (fallback / security)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      const data = response.data;
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      
      set({ 
        user: data, 
        token: data.token, 
        isAuthenticated: true, 
        loading: false 
      });
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Invalid credentials or connection issue.';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  signup: async (username, email, password, fullName) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/auth/signup', { username, email, password, fullName });
      set({ loading: false });
      return response.data.message;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Signup failed. Please try again.';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  verifyOtp: async (email, code) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/auth/verify-email', { email, code });
      set({ loading: false });
      return response.data.message;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Invalid OTP code.';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  forgotPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      set({ loading: false });
      return response.data.message;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to request reset token.';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  resetPassword: async (token, newPassword) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/auth/reset-password', { token, newPassword });
      set({ loading: false });
      return response.data.message;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to reset password.';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  forgotUsername: async (email) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/auth/forgot-username', { email });
      set({ loading: false });
      return response.data.message;
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to request username.';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.error("Logout request failed:", e);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false, error: null, loading: false });
  },

  signInWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      if (error) throw error;
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  }
}));

// On load, restore session by checking backend profile
const restoreSession = async () => {
  const token = localStorage.getItem('token');
  const isCallback = typeof window !== 'undefined' && window.location.pathname === '/auth/callback';

  if (!token || isCallback) {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false
    });
    return;
  }

  useAuthStore.setState({ loading: true });
  try {
    const response = await apiClient.get('/user/profile');
    const data = response.data;
    useAuthStore.setState({
      user: data,
      token: token,
      isAuthenticated: true,
      loading: false
    });
  } catch (err) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false
    });
  }
};

restoreSession();
export default useAuthStore;
