package com.indiantravelai.controller;

import com.indiantravelai.entity.Trip;
import com.indiantravelai.entity.User;
import com.indiantravelai.model.TripInvitation;
import com.indiantravelai.repository.TripInvitationRepositoryImpl;
import com.indiantravelai.repository.TripRepositoryImpl;
import com.indiantravelai.repository.UserRepositoryImpl;
import com.indiantravelai.service.TripService;
import com.indiantravelai.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/trips")
public class TripInvitationController {

    @Autowired
    private TripInvitationRepositoryImpl invitationRepository;

    @Autowired
    private TripRepositoryImpl tripRepository;

    @Autowired
    private UserRepositoryImpl userRepository;

    @Autowired
    private TripService tripService;

    @Autowired
    private EmailService emailService;

    @PostMapping("/invite")
    public ResponseEntity<?> inviteFriend(@RequestBody Map<String, String> body, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();

        String inviteeInput = body.get("inviteeUsername");
        if (inviteeInput == null || inviteeInput.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invitee username or email is required"));
        }

        inviteeInput = inviteeInput.trim();

        // 1. Check if inviting self
        if (inviteeInput.equalsIgnoreCase(principal.getName())) {
            return ResponseEntity.badRequest().body(Map.of("error", "You cannot invite yourself!"));
        }

        Optional<User> currentUserOpt = userRepository.findByUsername(principal.getName());
        String currentEmail = currentUserOpt.map(User::getEmail).orElse("");
        if (inviteeInput.equalsIgnoreCase(currentEmail)) {
            return ResponseEntity.badRequest().body(Map.of("error", "You cannot invite yourself!"));
        }

        // 2. Try to find the user in Supabase (by username OR email)
        Optional<User> inviteeOpt = userRepository.findByUsername(inviteeInput);
        if (inviteeOpt.isEmpty()) {
            inviteeOpt = userRepository.findByEmail(inviteeInput);
        }

        Trip activeTrip = tripService.getOrCreateActiveTrip(principal.getName());
        String targetIdentifier;
        boolean isUnregisteredEmail = false;

        if (inviteeOpt.isPresent()) {
            // User is already registered on Supabase
            targetIdentifier = inviteeOpt.get().getUsername();
        } else {
            // User is not found by username or email. Check if the input is a valid email pattern
            if (inviteeInput.contains("@") && inviteeInput.contains(".")) {
                targetIdentifier = inviteeInput; // Use the email directly
                isUnregisteredEmail = true;
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "User '" + inviteeInput + "' does not exist. Please enter their registered username or a valid email address to invite them."));
            }
        }

        // 3. Check if an invite already exists
        List<TripInvitation> existing = invitationRepository.findByTripId(activeTrip.getId());
        final String finalTarget = targetIdentifier;
        boolean alreadyInvited = existing.stream()
                .anyMatch(i -> i.getInviteeUsername().equalsIgnoreCase(finalTarget) && !i.getStatus().equals("REJECTED"));

        if (alreadyInvited) {
            return ResponseEntity.badRequest().body(Map.of("error", "This user is already invited or a member of this trip."));
        }

        TripInvitation invitation = new TripInvitation(
                activeTrip.getId(),
                principal.getName(),
                targetIdentifier,
                "PENDING"
        );

        TripInvitation saved = invitationRepository.save(invitation);

        // 4. Send email dispatch
        if (isUnregisteredEmail) {
            emailService.sendTripInvitationEmail(targetIdentifier, principal.getName(), activeTrip.getTitle());
        } else {
            // Also send email to registered user if their email is available
            String registeredEmail = inviteeOpt.get().getEmail();
            if (registeredEmail != null && !registeredEmail.isEmpty()) {
                emailService.sendTripInvitationEmail(registeredEmail, principal.getName(), activeTrip.getTitle());
            }
        }

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/invitations")
    public ResponseEntity<?> getInvitations(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();

        String username = principal.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        String email = userOpt.map(User::getEmail).orElse("");

        // Find invitations matching by username or by email
        List<TripInvitation> received = new ArrayList<>();
        received.addAll(invitationRepository.findByInviteeUsernameAndStatus(username, "PENDING"));
        if (!email.isEmpty() && !email.equalsIgnoreCase(username)) {
            received.addAll(invitationRepository.findByInviteeUsernameAndStatus(email, "PENDING"));
        }

        List<TripInvitation> sent = invitationRepository.findByInviterUsername(username);

        Map<String, Object> response = new HashMap<>();
        response.put("received", received);
        response.put("sent", sent);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/invitations/{id}/accept")
    public ResponseEntity<?> acceptInvitation(@PathVariable Long id, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();

        Optional<TripInvitation> inviteOpt = invitationRepository.findById(id);
        if (inviteOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        TripInvitation invite = inviteOpt.get();
        Optional<User> userOpt = userRepository.findByUsername(principal.getName());
        String email = userOpt.map(User::getEmail).orElse("");

        // Verify if this invitation is for the logged in user
        if (!invite.getInviteeUsername().equalsIgnoreCase(principal.getName()) &&
            !invite.getInviteeUsername().equalsIgnoreCase(email)) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized to accept this invitation."));
        }

        // If it was an invitation sent by email, update inviteeUsername to their actual username
        if (invite.getInviteeUsername().equalsIgnoreCase(email)) {
            invite.setInviteeUsername(principal.getName());
        }

        invite.setStatus("ACCEPTED");
        invitationRepository.save(invite);
        return ResponseEntity.ok(Map.of("message", "Invitation accepted successfully!"));
    }

    @PostMapping("/invitations/{id}/reject")
    public ResponseEntity<?> rejectInvitation(@PathVariable Long id, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();

        Optional<TripInvitation> inviteOpt = invitationRepository.findById(id);
        if (inviteOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        TripInvitation invite = inviteOpt.get();
        Optional<User> userOpt = userRepository.findByUsername(principal.getName());
        String email = userOpt.map(User::getEmail).orElse("");

        if (!invite.getInviteeUsername().equalsIgnoreCase(principal.getName()) &&
            !invite.getInviteeUsername().equalsIgnoreCase(email) &&
            !invite.getInviterUsername().equalsIgnoreCase(principal.getName())) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized to manage this invitation."));
        }

        invite.setStatus("REJECTED");
        invitationRepository.save(invite);
        return ResponseEntity.ok(Map.of("message", "Invitation rejected successfully."));
    }

    @GetMapping("/{tripId}/members")
    public ResponseEntity<?> getTripMembers(@PathVariable Long tripId, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();

        Optional<Trip> tripOpt = tripRepository.findById(tripId);
        if (tripOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Trip trip = tripOpt.get();
        
        // Find owner username
        Optional<User> ownerOpt = userRepository.findById(trip.getUserId());
        String ownerUsername = ownerOpt.map(User::getUsername).orElse("Owner");
        String ownerFullName = ownerOpt.map(User::getFullName).orElse("Owner");

        List<TripInvitation> accepts = invitationRepository.findByTripId(tripId).stream()
                .filter(i -> i.getStatus().equals("ACCEPTED"))
                .toList();

        List<Map<String, String>> members = new ArrayList<>();
        // Add owner
        members.add(Map.of("username", ownerUsername, "fullName", ownerFullName, "role", "OWNER"));

        for (TripInvitation invite : accepts) {
            Optional<User> uOpt = userRepository.findByUsername(invite.getInviteeUsername());
            String fullName = uOpt.map(User::getFullName).orElse(invite.getInviteeUsername());
            members.add(Map.of("username", invite.getInviteeUsername(), "fullName", fullName, "role", "MEMBER"));
        }

        return ResponseEntity.ok(members);
    }
}
