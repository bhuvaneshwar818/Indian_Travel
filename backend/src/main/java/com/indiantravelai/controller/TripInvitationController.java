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

        try {
            String inviteeInput = body.get("inviteeUsername");
            if (inviteeInput == null || inviteeInput.trim().isEmpty()) {
                return ResponseEntity.ok().body(Map.of("error", "Invitee username or email is required"));
            }

            inviteeInput = inviteeInput.trim();

            // 1. Check if inviting self
            if (inviteeInput.equalsIgnoreCase(principal.getName())) {
                return ResponseEntity.ok().body(Map.of("error", "You cannot invite yourself!"));
            }

            Optional<User> currentUserOpt = userRepository.findByUsername(principal.getName());
            String currentEmail = currentUserOpt.map(User::getEmail).orElse("");
            if (inviteeInput.equalsIgnoreCase(currentEmail)) {
                return ResponseEntity.ok().body(Map.of("error", "You cannot invite yourself!"));
            }

            // Ensure input is an email address
            if (!inviteeInput.contains("@") || !inviteeInput.contains(".")) {
                return ResponseEntity.ok().body(Map.of("error", "Please provide a valid email address to send an invitation."));
            }

            // Check if invitee email exists in the database
            String inviteeEmail = inviteeInput.toLowerCase().trim();
            System.out.println("[INVITE] Looking up email: " + inviteeEmail);
            Optional<User> inviteeUser = userRepository.findByEmail(inviteeEmail);
            System.out.println("[INVITE] User found: " + inviteeUser.isPresent());
            if (inviteeUser.isEmpty()) {
                // Also try finding by username in case user enters username
                Optional<User> inviteeByUsername = userRepository.findByUsername(inviteeInput.trim());
                System.out.println("[INVITE] Found by username: " + inviteeByUsername.isPresent());
                if (inviteeByUsername.isEmpty()) {
                    return ResponseEntity.ok().body(Map.of("error", "No user found with this email. Please ask them to sign up first."));
                }
            }

            Trip activeTrip = tripService.getOrCreateActiveTrip(principal.getName());
            String targetIdentifier = inviteeInput.toLowerCase();

            // 3. Check if an invite already exists
            List<TripInvitation> existing = invitationRepository.findByTripId(activeTrip.getId());
            boolean alreadyInvited = existing.stream()
                    .anyMatch(i -> i.getInviteeUsername().equalsIgnoreCase(targetIdentifier) && !i.getStatus().equals("REJECTED"));

            if (alreadyInvited) {
                return ResponseEntity.ok().body(Map.of("error", "This email is already invited or a member of this trip."));
            }

            TripInvitation invitation = new TripInvitation(
                    activeTrip.getId(),
                    principal.getName(),
                    targetIdentifier,
                    "PENDING"
            );

            TripInvitation saved = invitationRepository.save(invitation);

            // 4. Send email dispatch
            emailService.sendTripInvitationEmail(targetIdentifier, principal.getName(), activeTrip.getTitle());

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.ok().body(Map.of("error", "Failed to send invitation. Please try again."));
        }
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
            members.add(Map.of(
                "username", invite.getInviteeUsername(),
                "fullName", fullName,
                "role", invite.getRole() != null ? invite.getRole() : "MEMBER"
            ));
        }

        return ResponseEntity.ok(members);
    }

    @PostMapping("/{tripId}/members/{username}/role")
    public ResponseEntity<?> changeMemberRole(
            @PathVariable Long tripId,
            @PathVariable String username,
            @RequestBody Map<String, String> body,
            Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();

        Optional<Trip> tripOpt = tripRepository.findById(tripId);
        if (tripOpt.isEmpty()) return ResponseEntity.notFound().build();
        Trip trip = tripOpt.get();

        // Only the main owner (trip creator) can change roles
        Optional<User> creatorOpt = userRepository.findById(trip.getUserId());
        if (creatorOpt.isEmpty() || !creatorOpt.get().getUsername().equalsIgnoreCase(principal.getName())) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the main owner can assign co-ownership."));
        }

        String newRole = body.get("role");
        if (newRole == null || (!newRole.equals("CO_OWNER") && !newRole.equals("MEMBER"))) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role. Must be CO_OWNER or MEMBER."));
        }

        // Find the invitation for this member
        List<TripInvitation> invites = invitationRepository.findByTripId(tripId);
        TripInvitation targetInvite = invites.stream()
                .filter(i -> i.getInviteeUsername().equalsIgnoreCase(username) && i.getStatus().equals("ACCEPTED"))
                .findFirst()
                .orElse(null);

        if (targetInvite == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User is not a member of this trip."));
        }

        if (newRole.equals("CO_OWNER")) {
            // Count current owners (main owner + accepted co-owners)
            long currentOwnersCount = 1; // The main owner
            currentOwnersCount += invites.stream()
                    .filter(i -> i.getStatus().equals("ACCEPTED") && "CO_OWNER".equals(i.getRole()))
                    .count();

            if (currentOwnersCount >= 3) {
                return ResponseEntity.badRequest().body(Map.of("error", "A trip can have at most 3 owners."));
            }
        }

        targetInvite.setRole(newRole);
        invitationRepository.save(targetInvite);
        return ResponseEntity.ok(Map.of("message", "Role updated successfully."));
    }

    @DeleteMapping("/{tripId}/members/{username}")
    public ResponseEntity<?> removeMember(
            @PathVariable Long tripId,
            @PathVariable String username,
            Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();

        Optional<Trip> tripOpt = tripRepository.findById(tripId);
        if (tripOpt.isEmpty()) return ResponseEntity.notFound().build();
        Trip trip = tripOpt.get();

        Optional<User> creatorOpt = userRepository.findById(trip.getUserId());
        String creatorName = creatorOpt.map(User::getUsername).orElse("");

        boolean isMainOwner = creatorName.equalsIgnoreCase(principal.getName());
        boolean isSelfRemoval = username.equalsIgnoreCase(principal.getName());

        List<TripInvitation> invites = invitationRepository.findByTripId(tripId);
        TripInvitation requesterInvite = invites.stream()
                .filter(i -> i.getInviteeUsername().equalsIgnoreCase(principal.getName()) && i.getStatus().equals("ACCEPTED"))
                .findFirst()
                .orElse(null);

        boolean isCoOwner = requesterInvite != null && "CO_OWNER".equals(requesterInvite.getRole());

        // Find invitation to remove
        TripInvitation targetInvite = invites.stream()
                .filter(i -> i.getInviteeUsername().equalsIgnoreCase(username) && i.getStatus().equals("ACCEPTED"))
                .findFirst()
                .orElse(null);

        if (targetInvite == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Member not found."));
        }

        if (isMainOwner) {
            if (isSelfRemoval) {
                return ResponseEntity.badRequest().body(Map.of("error", "The main owner cannot leave the trip. Delete the trip instead."));
            }
        } else if (isCoOwner) {
            if (creatorName.equalsIgnoreCase(username)) {
                return ResponseEntity.status(403).body(Map.of("error", "You cannot remove the main owner."));
            }
            if ("CO_OWNER".equals(targetInvite.getRole())) {
                return ResponseEntity.status(403).body(Map.of("error", "You cannot remove other co-owners. Only the main owner can."));
            }
        } else {
            if (!isSelfRemoval) {
                return ResponseEntity.status(403).body(Map.of("error", "You do not have permission to remove members."));
            }
        }

        invitationRepository.delete(targetInvite.getId());
        return ResponseEntity.ok(Map.of("message", isSelfRemoval ? "You left the trip." : "Member removed successfully."));
    }
}
