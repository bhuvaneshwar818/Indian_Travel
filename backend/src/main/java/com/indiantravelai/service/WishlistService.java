package com.indiantravelai.service;

import com.indiantravelai.dto.WishlistDto;
import com.indiantravelai.entity.Trip;
import com.indiantravelai.entity.User;
import com.indiantravelai.model.WishlistPlace;
import com.indiantravelai.repository.TripRepositoryImpl;
import com.indiantravelai.repository.UserRepositoryImpl;
import com.indiantravelai.repository.WishlistRepositoryImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepositoryImpl wishlistRepository;

    @Autowired
    private TripRepositoryImpl tripRepository;

    @Autowired
    private UserRepositoryImpl userRepository;

    @Autowired
    private TripService tripService;

    public List<WishlistDto> getWishlist(String username) {
        Trip trip = tripService.getOrCreateActiveTrip(username);
        List<WishlistPlace> places = wishlistRepository.findByTripIdOrderBySortOrderAsc(trip.getId());
        return places.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public WishlistDto addPlace(String username, WishlistDto dto) {
        Trip trip = tripService.getOrCreateActiveTrip(username);
        
        List<WishlistPlace> currentList = wishlistRepository.findByTripIdOrderBySortOrderAsc(trip.getId());
        int nextOrder = currentList.size() + 1;

        WishlistPlace place = new WishlistPlace(
                trip.getId(),
                dto.getPlaceName(),
                dto.getState(),
                dto.getCategory(),
                dto.getLat() != null ? dto.getLat() : 20.5937,
                dto.getLng() != null ? dto.getLng() : 78.9629,
                nextOrder
        );
        
        WishlistPlace saved = wishlistRepository.save(place);
        return convertToDto(saved);
    }

    public void removePlace(String username, Long id) {
        WishlistPlace place = wishlistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Wishlist place not found with id: " + id));
        
        verifyOwnership(place.getTripId(), username);
        
        wishlistRepository.delete(place);
    }

    public void reorderWishlist(String username, List<Long> ids) {
        Trip trip = tripService.getOrCreateActiveTrip(username);
        List<WishlistPlace> places = wishlistRepository.findByTripIdOrderBySortOrderAsc(trip.getId());
        
        for (int i = 0; i < ids.size(); i++) {
            Long targetId = ids.get(i);
            int finalIndex = i + 1;
            places.stream()
                  .filter(p -> p.getId().equals(targetId))
                  .findFirst()
                  .ifPresent(p -> {
                      p.setSortOrder(finalIndex);
                      wishlistRepository.save(p);
                  });
        }
    }

    public WishlistDto updatePlaceName(String username, Long id, String newName) {
        WishlistPlace place = wishlistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Wishlist place not found with id: " + id));
        
        verifyOwnership(place.getTripId(), username);
        
        place.setPlaceName(newName);
        WishlistPlace saved = wishlistRepository.save(place);
        return convertToDto(saved);
    }

    private void verifyOwnership(Long tripId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found: " + tripId));
        if (!trip.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized operation on wishlist");
        }
    }

    private WishlistDto convertToDto(WishlistPlace place) {
        return new WishlistDto(
                place.getId(),
                place.getTripId(),
                place.getPlaceName(),
                place.getState(),
                place.getCategory(),
                place.getLat(),
                place.getLng(),
                place.getSortOrder(),
                place.getAddedAt()
        );
    }
}
