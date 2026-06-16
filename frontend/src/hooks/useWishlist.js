import { useEffect } from 'react'
import { useWishlistStore } from '../store/useWishlistStore'

export function useWishlist() {
  const {
    wishlist,
    loading,
    error,
    fetchWishlist,
    addPlaceToWishlist,
    removePlaceFromWishlist,
    reorderWishlist
  } = useWishlistStore();

  useEffect(() => {
    // Auto-fetch if empty on first consumer mount
    if (wishlist.length === 0) {
      fetchWishlist();
    }
  }, [fetchWishlist, wishlist.length]);

  return {
    wishlist,
    loading,
    error,
    addPlace: addPlaceToWishlist,
    removePlace: removePlaceFromWishlist,
    reorder: reorderWishlist,
    refresh: fetchWishlist
  };
}
