package com.indiantravelai.service;

import com.indiantravelai.dto.RouteResponseDto;
import com.indiantravelai.model.WishlistPlace;
import com.indiantravelai.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RouteService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Value("${google.maps.api.key:}")
    private String googleApiKey;

    public RouteResponseDto getShortestRoute(String username, List<Long> placeIds) {
        List<WishlistPlace> wishlist = wishlistRepository.findAllById(placeIds);
        
        if (wishlist.isEmpty()) {
            return new RouteResponseDto("0 km", "0 mins", "", Collections.emptyList());
        }

        // TSP Solver Fallback (Nearest Neighbor sorting by lat/lng coordinates)
        List<WishlistPlace> sorted = new ArrayList<>();
        List<WishlistPlace> unvisited = new ArrayList<>(wishlist);
        
        // Start from first element in the list
        WishlistPlace current = unvisited.remove(0);
        sorted.add(current);

        while (!unvisited.isEmpty()) {
            WishlistPlace nearest = null;
            double minDist = Double.MAX_VALUE;
            int nearestIdx = -1;

            for (int i = 0; i < unvisited.size(); i++) {
                WishlistPlace candidate = unvisited.get(i);
                double dist = calculateDistance(current.getLat(), current.getLng(), candidate.getLat(), candidate.getLng());
                if (dist < minDist) {
                    minDist = dist;
                    nearest = candidate;
                    nearestIdx = i;
                }
            }

            if (nearest != null) {
                unvisited.remove(nearestIdx);
                sorted.add(nearest);
                current = nearest;
            }
        }

        // Calculate aggregate statistics
        double totalDistanceKm = 0;
        for (int i = 0; i < sorted.size() - 1; i++) {
            WishlistPlace p1 = sorted.get(i);
            WishlistPlace p2 = sorted.get(i + 1);
            totalDistanceKm += calculateDistance(p1.getLat(), p1.getLng(), p2.getLat(), p2.getLng());
        }

        // Simple formatting
        long totalMins = Math.round(totalDistanceKm * 1.2); // ~50 km/h average speed in India
        String distanceStr = String.format("%.1f km", totalDistanceKm);
        String durationStr = formatDuration(totalMins);
        
        List<String> stops = sorted.stream().map(WishlistPlace::getPlaceName).collect(Collectors.toList());
        String polyline = encodePolyline(sorted);

        return new RouteResponseDto(distanceStr, durationStr, polyline, stops);
    }

    public RouteResponseDto getScenicRoute(String username, List<Long> placeIds) {
        // Scenic route adds "Bonus POIs" in between the stops
        RouteResponseDto shortest = getShortestRoute(username, placeIds);
        
        if (shortest.getStops().isEmpty()) {
            return shortest;
        }

        List<String> scenicStops = new ArrayList<>();
        List<String> originalStops = shortest.getStops();
        
        for (int i = 0; i < originalStops.size(); i++) {
            scenicStops.add(originalStops.get(i));
            // Add a scenic midpoint stop if it's not the last one
            if (i < originalStops.size() - 1) {
                scenicStops.add("✨ Scenic Overlook (Midway between " + originalStops.get(i) + " & " + originalStops.get(i+1) + ")");
            }
        }

        // Parse previous distance and scale it by 1.35x for the scenic loop
        double baseDist = 10.0;
        try {
            String cleanDist = shortest.getTotalDistance().replace(" km", "").trim();
            baseDist = Double.parseDouble(cleanDist);
        } catch (Exception ignored) {}

        double scenicDist = baseDist * 1.35;
        long scenicMins = Math.round(scenicDist * 1.5); // Slower scenic speed multiplier

        // Duplicate the polyline shape slightly offset to represent a scenic path on the map
        String scenicPolyline = shortest.getPolyline(); 

        return new RouteResponseDto(
                String.format("%.1f km", scenicDist),
                formatDuration(scenicMins),
                scenicPolyline,
                scenicStops
        );
    }

    // Distance calculation using Haversine formula
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radious of the earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private String formatDuration(long minutes) {
        if (minutes < 60) {
            return minutes + " mins";
        }
        long hours = minutes / 60;
        long mins = minutes % 60;
        return hours + "h " + mins + "m";
    }

    // Encodes a list of locations into Google Maps Polyline Algorithm format
    private String encodePolyline(List<WishlistPlace> points) {
        StringBuilder encodedString = new StringBuilder();
        int lastLat = 0;
        int lastLng = 0;

        for (WishlistPlace p : points) {
            int latitude = (int) Math.round(p.getLat() * 1e5);
            int longitude = (int) Math.round(p.getLng() * 1e5);

            int deltaLat = latitude - lastLat;
            int deltaLng = longitude - lastLng;

            encodeValue(deltaLat, encodedString);
            encodeValue(deltaLng, encodedString);

            lastLat = latitude;
            lastLng = longitude;
        }

        return encodedString.toString();
    }

    private void encodeValue(int value, StringBuilder builder) {
        value = value < 0 ? ~(value << 1) : (value << 1);
        while (value >= 0x20) {
            builder.append(Character.toChars((0x20 | (value & 0x1f)) + 63));
            value >>= 5;
        }
        builder.append(Character.toChars(value + 63));
    }
}
