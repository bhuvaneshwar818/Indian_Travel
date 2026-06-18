package com.indiantravelai.controller;

import com.indiantravelai.dto.WishlistDto;
import com.indiantravelai.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistDto>> getWishlist(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(wishlistService.getWishlist(principal.getName()));
    }

    @PostMapping
    public ResponseEntity<WishlistDto> addPlace(@RequestBody WishlistDto dto, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(wishlistService.addPlace(principal.getName(), dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removePlace(@PathVariable Long id, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        try {
            wishlistService.removePlace(principal.getName(), id);
            Map<String, String> res = new HashMap<>();
            res.put("message", "Place removed from wishlist successfully.");
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PutMapping("/reorder")
    public ResponseEntity<?> reorderWishlist(@RequestBody List<Long> ids, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        try {
            wishlistService.reorderWishlist(principal.getName(), ids);
            Map<String, String> res = new HashMap<>();
            res.put("message", "Wishlist reordered successfully.");
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePlaceName(@PathVariable Long id, @RequestBody Map<String, String> body, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        try {
            String newName = body.get("placeName");
            if (newName == null || newName.trim().isEmpty()) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Place name cannot be empty");
                return ResponseEntity.badRequest().body(err);
            }
            WishlistDto updated = wishlistService.updatePlaceName(principal.getName(), id, newName.trim());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }
}
