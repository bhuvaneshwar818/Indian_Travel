import { apiClient } from '../store/authStore'

export const wishlistApi = {
  getWishlist: () => apiClient.get('/wishlist'),
  addPlace: (place) => apiClient.post('/wishlist', place),
  removePlace: (id) => apiClient.delete(`/wishlist/${id}`),
  reorder: (ids) => apiClient.put('/wishlist/reorder', ids)
};
