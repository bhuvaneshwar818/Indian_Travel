package com.indiantravelai.controller;

import com.indiantravelai.entity.Bookmark;
import com.indiantravelai.entity.Destination;
import com.indiantravelai.entity.User;
import com.indiantravelai.repository.BookmarkRepository;
import com.indiantravelai.repository.DestinationRepository;
import com.indiantravelai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private BookmarkRepository bookmarkRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        Optional<User> userOpt = userRepository.findByUsername(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User profile not found");
        }

        User user = userOpt.get();
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("username", user.getUsername());
        profile.put("email", user.getEmail());
        profile.put("fullName", user.getFullName());
        profile.put("role", user.getRole());
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/bookmarks")
    public ResponseEntity<List<Destination>> getBookmarks(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        List<Bookmark> bookmarks = bookmarkRepository.findByUserUsername(principal.getName());
        List<Destination> destinations = bookmarks.stream()
                .map(Bookmark::getDestination)
                .collect(Collectors.toList());
        return ResponseEntity.ok(destinations);
    }

    @PostMapping("/bookmarks/{destId}")
    public ResponseEntity<?> addBookmark(@PathVariable Long destId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        Optional<User> userOpt = userRepository.findByUsername(principal.getName());
        Optional<Destination> destOpt = destinationRepository.findById(destId);

        if (userOpt.isEmpty() || destOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User or Destination does not exist.");
        }

        if (bookmarkRepository.existsByUserUsernameAndDestinationId(principal.getName(), destId)) {
            return ResponseEntity.ok("Destination is already bookmarked!");
        }

        Bookmark bookmark = new Bookmark(userOpt.get(), destOpt.get());
        bookmarkRepository.save(bookmark);
        return ResponseEntity.ok("Destination bookmarked successfully!");
    }

    @DeleteMapping("/bookmarks/{destId}")
    @Transactional
    public ResponseEntity<?> removeBookmark(@PathVariable Long destId, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        
        bookmarkRepository.deleteByUserUsernameAndDestinationId(principal.getName(), destId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Bookmark removed successfully.");
        return ResponseEntity.ok(response);
    }
}
