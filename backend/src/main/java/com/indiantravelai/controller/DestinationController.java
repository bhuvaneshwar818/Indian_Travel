package com.indiantravelai.controller;

import com.indiantravelai.entity.Destination;
import com.indiantravelai.service.DestinationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;

@RestController
@RequestMapping("/api/destinations")
public class DestinationController {

    @Autowired
    private DestinationService destinationService;

    @GetMapping
    public ResponseEntity<List<Destination>> getDestinations(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String category) {
        
        List<Destination> results = destinationService.getByStateAndCategory(state, category);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Destination> getDestinationById(@PathVariable Long id) {
        try {
            Destination dest = destinationService.getById(id);
            return ResponseEntity.ok(dest);
        } catch (RuntimeException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Destination> createDestination(@RequestBody Destination destination) {
        Destination saved = destinationService.addDestination(destination);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/reverse-geocode")
    public ResponseEntity<?> reverseGeocode(@RequestParam Double lat, @RequestParam Double lng) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "IndianTravelAI/1.0");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            String url = String.format(java.util.Locale.US, "https://nominatim.openstreetmap.org/reverse?format=json&lat=%f&lon=%f", lat, lng);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
