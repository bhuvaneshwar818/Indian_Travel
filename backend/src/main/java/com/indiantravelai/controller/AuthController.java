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

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

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

        org.springframework.http.ResponseCookie responseCookie = org.springframework.http.ResponseCookie.from("auth_token", dto.getAccessToken())
                .httpOnly(true)
                .secure(false) // false for local http development
                .path("/")
                .maxAge(60 * 60 * 24) // 24 hours
                .sameSite("Strict")
                .build();
        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, responseCookie.toString());

        return ResponseEntity.ok(Map.of(
            "message", "Session set",
            "userId", supabaseJwtService.extractUserId(dto.getAccessToken()),
            "email", supabaseJwtService.extractEmail(dto.getAccessToken())
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
