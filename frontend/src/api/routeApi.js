import { apiClient } from '../store/authStore'

export const routeApi = {
  getShortestRoute: (placeIds) => apiClient.post('/route/shortest', { placeIds }),
  getScenicRoute: (placeIds) => apiClient.post('/route/scenic', { placeIds })
};
