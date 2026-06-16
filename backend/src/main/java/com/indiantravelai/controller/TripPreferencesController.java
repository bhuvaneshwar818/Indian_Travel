package com.indiantravelai.controller;

import com.indiantravelai.dto.TripPreferencesDto;
import com.indiantravelai.entity.Trip;
import com.indiantravelai.entity.User;
import com.indiantravelai.repository.TripRepository;
import com.indiantravelai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/trip")
public class TripPreferencesController {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    private Trip getOrCreateActiveTrip(String username) {
        List<Trip> trips = tripRepository.findByUserUsernameOrderByCreatedAtDesc(username);
        if (!trips.isEmpty()) {
            return trips.get(0);
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        Trip placeholder = new Trip();
        placeholder.setUser(user);
        placeholder.setTitle("My Active Plan");
        placeholder.setState("Goa");
        placeholder.setCategory("Beaches");
        placeholder.setBudget("Moderate");
        placeholder.setDuration(3);
        placeholder.setTotalBudgetEstimate(5000.0);
        placeholder.setTravelMode("SOLO");
        placeholder.setTransportMode("PUBLIC");
        placeholder.setStartLocation("Mumbai");
        
        return tripRepository.save(placeholder);
    }

    @GetMapping("/preferences")
    public ResponseEntity<TripPreferencesDto> getPreferences(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();

        Trip trip = getOrCreateActiveTrip(principal.getName());
        TripPreferencesDto dto = new TripPreferencesDto(
                trip.getTravelMode() != null ? trip.getTravelMode() : "SOLO",
                trip.getGroupSize() != null ? trip.getGroupSize() : 1,
                trip.getTransportMode() != null ? trip.getTransportMode() : "PUBLIC",
                trip.getStartLocation() != null ? trip.getStartLocation() : ""
        );
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/preferences")
    public ResponseEntity<TripPreferencesDto> savePreferences(@RequestBody TripPreferencesDto dto, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();

        Trip trip = getOrCreateActiveTrip(principal.getName());
        trip.setTravelMode(dto.getTravelMode());
        trip.setGroupSize(dto.getGroupSize());
        trip.setTransportMode(dto.getTransportMode());
        trip.setStartLocation(dto.getStartLocation());
        
        tripRepository.save(trip);
        return ResponseEntity.ok(dto);
    }
}
