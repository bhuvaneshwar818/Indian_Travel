package com.indiantravelai.controller;

import com.indiantravelai.dto.*;
import com.indiantravelai.service.AuthService;
import com.indiantravelai.service.SupabaseJwtService;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.indiantravelai.entity.User;
import com.indiantravelai.repository.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest request) {
        try {
            String result = authService.registerUser(request);
            Map<String, String> response = new HashMap<>();
            response.put("message", result);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            Map<String, String> err = new HashMap<>();
            err.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@Valid @RequestBody OtpVerifyRequest request) {
        try {
            String result = authService.verifyEmail(request);
            Map<String, String> response = new HashMap<>();
            response.put("message", result);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            Map<String, String> err = new HashMap<>();
            err.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        try {
            JwtResponse jwtResponse = authService.loginUser(request);
            
            // Set HttpOnly cookie containing the locally generated JWT
            org.springframework.http.ResponseCookie responseCookie = org.springframework.http.ResponseCookie.from("auth_token", jwtResponse.getToken())
                    .httpOnly(true)
                    .secure(false) // false for local HTTP development
                    .path("/")
                    .maxAge(60 * 60 * 24) // 24 hours
                    .sameSite("Strict")
                    .build();
            response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, responseCookie.toString());

            return ResponseEntity.ok(jwtResponse);
        } catch (RuntimeException ex) {
            Map<String, String> err = new HashMap<>();
            err.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            String result = authService.forgotPassword(request.getEmail());
            Map<String, String> response = new HashMap<>();
            response.put("message", result);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            Map<String, String> err = new HashMap<>();
            err.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            String result = authService.resetPassword(request);
            Map<String, String> response = new HashMap<>();
            response.put("message", result);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            Map<String, String> err = new HashMap<>();
            err.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PostMapping("/forgot-username")
    public ResponseEntity<?> forgotUsername(@Valid @RequestBody ForgotPasswordRequest request) {
        // ForgotPasswordRequest has 'email' which is what we need
        try {
            String result = authService.forgotUsername(request.getEmail());
            Map<String, String> response = new HashMap<>();
            response.put("message", result);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            Map<String, String> err = new HashMap<>();
            err.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @Autowired
    private SupabaseJwtService supabaseJwtService;

    // Called by frontend after Supabase login to set HttpOnly cookie
    @PostMapping("/session")
    public ResponseEntity<?> setSession(
            @Valid @RequestBody SessionRequestDto dto,
            HttpServletResponse response) {

        if (!supabaseJwtService.isTokenValid(dto.getAccessToken())) {
            return ResponseEntity.status(401).body("Invalid token");
        }

        String email = supabaseJwtService.extractEmail(dto.getAccessToken());
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            Claims claims = supabaseJwtService.validateAndExtract(dto.getAccessToken());
            Map<String, Object> userMetadata = (Map<String, Object>) claims.get("user_metadata");
            String fullName = null;
            if (userMetadata != null) {
                fullName = (String) userMetadata.get("full_name");
            }
            if (fullName == null || fullName.trim().isEmpty()) {
                fullName = email.split("@")[0];
            }

            return ResponseEntity.ok(Map.of(
                "isNewUser", true,
                "email", email,
                "fullName", fullName
            ));
        }

        User user = userOpt.get();
        org.springframework.http.ResponseCookie responseCookie = org.springframework.http.ResponseCookie.from("auth_token", dto.getAccessToken())
                .httpOnly(true)
                .secure(false) // false for local http development
                .path("/")
                .maxAge(60 * 60 * 24) // 24 hours
                .sameSite("Strict")
                .build();
        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, responseCookie.toString());

        return ResponseEntity.ok(Map.of(
            "isNewUser", false,
            "message", "Session set",
            "userId", user.getId(),
            "username", user.getUsername(),
            "email", user.getEmail(),
            "fullName", user.getFullName(),
            "role", user.getRole()
        ));
    }

    public static class SignupGoogleRequest {
        @NotBlank(message = "Access token is required")
        private String accessToken;
        @NotBlank(message = "Username is required")
        private String username;
        @NotBlank(message = "Password is required")
        private String password;

        public String getAccessToken() { return accessToken; }
        public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    @PostMapping("/signup-google")
    public ResponseEntity<?> registerGoogleUser(
            @Valid @RequestBody SignupGoogleRequest request,
            HttpServletResponse response) {

        if (!supabaseJwtService.isTokenValid(request.getAccessToken())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid Supabase token"));
        }

        String email = supabaseJwtService.extractEmail(request.getAccessToken());
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already registered!"));
        }

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }

        // Validate password complexity
        String password = request.getPassword();
        if (password.length() < 8 ||
            !password.matches(".*[A-Z].*") ||
            !password.matches(".*[a-z].*") ||
            !password.matches(".*[0-9].*") ||
            !password.matches(".*[!@#$%^&*(),.?\":{}|<>].*")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password does not meet complexity requirements"));
        }

        Claims claims = supabaseJwtService.validateAndExtract(request.getAccessToken());
        Map<String, Object> userMetadata = (Map<String, Object>) claims.get("user_metadata");
        String fullName = null;
        if (userMetadata != null) {
            fullName = (String) userMetadata.get("full_name");
        }
        if (fullName == null || fullName.trim().isEmpty()) {
            fullName = email.split("@")[0];
        }

        // Save User
        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_USER");
        user.setEnabled(true);
        user.setEmailVerified(true);
        userRepository.save(user);

        // Set HttpOnly auth cookie using the Supabase token
        org.springframework.http.ResponseCookie responseCookie = org.springframework.http.ResponseCookie.from("auth_token", request.getAccessToken())
                .httpOnly(true)
                .secure(false) // false for local http development
                .path("/")
                .maxAge(60 * 60 * 24) // 24 hours
                .sameSite("Strict")
                .build();
        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, responseCookie.toString());

        return ResponseEntity.ok(Map.of(
            "message", "Account created successfully",
            "userId", user.getId(),
            "username", user.getUsername(),
            "email", user.getEmail(),
            "fullName", user.getFullName(),
            "role", user.getRole()
        ));
    }

    // Clear HttpOnly cookie on logout
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        org.springframework.http.ResponseCookie responseCookie = org.springframework.http.ResponseCookie.from("auth_token", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0) // expire immediately
                .sameSite("Strict")
                .build();
        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, responseCookie.toString());
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }
}
