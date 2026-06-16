import { apiClient } from '../store/authStore'

export const transportApi = {
  getTimings: (from, to) => apiClient.get(`/transport/timings?from=${from}&to=${to}`)
};
