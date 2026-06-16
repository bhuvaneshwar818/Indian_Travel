package com.indiantravelai.controller;

import com.indiantravelai.entity.Destination;
import com.indiantravelai.service.DestinationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
