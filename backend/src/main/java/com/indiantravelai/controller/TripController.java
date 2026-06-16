package com.indiantravelai.controller;

import com.indiantravelai.dto.TripPlanRequest;
import com.indiantravelai.entity.Trip;
import com.indiantravelai.service.TripService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    @Autowired
    private TripService tripService;

    @GetMapping
    public ResponseEntity<List<Trip>> getUserTrips(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        List<Trip> trips = tripService.getTripsByUsername(principal.getName());
        return ResponseEntity.ok(trips);
    }

    @PostMapping
    public ResponseEntity<?> createTrip(@Valid @RequestBody TripPlanRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            Trip savedTrip = tripService.saveTrip(principal.getName(), request);
            return ResponseEntity.ok(savedTrip);
        } catch (RuntimeException ex) {
            Map<String, String> err = new HashMap<>();
            err.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTrip(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            tripService.deleteTrip(id, principal.getName());
            Map<String, String> response = new HashMap<>();
            response.put("message", "Trip deleted successfully.");
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            Map<String, String> err = new HashMap<>();
            err.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }
}
