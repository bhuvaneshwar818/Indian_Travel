import { apiClient } from '../store/authStore';

const authApi = {
  // Send Supabase JWT to backend → backend sets HttpOnly cookie
  setSession: (accessToken) =>
    apiClient.post('/auth/session', { accessToken }, { withCredentials: true }),

  // Backend clears the HttpOnly cookie
  clearSession: () =>
    apiClient.post('/auth/logout', {}, { withCredentials: true }),

  // Get current user profile from backend
  getProfile: () =>
    apiClient.get('/user/profile', { withCredentials: true }),
};

export default authApi;
