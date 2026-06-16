package com.indiantravelai.config;

import com.indiantravelai.entity.User;
import com.indiantravelai.repository.UserRepository;
import com.indiantravelai.service.SupabaseJwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class SupabaseJwtFilter extends OncePerRequestFilter {

    @Autowired
    private SupabaseJwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest req,
                                    HttpServletResponse res,
                                    FilterChain chain)
            throws ServletException, IOException {

        // If request is already authenticated by the local JwtAuthenticationFilter, skip Supabase check
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            String token = extractTokenFromCookie(req);

            if (token != null && jwtService.isTokenValid(token)) {
                try {
                    String email = jwtService.extractEmail(token);
                    Claims claims = jwtService.validateAndExtract(token);
                    
                    // Extract full name from user metadata if available
                    Map<String, Object> userMetadata = (Map<String, Object>) claims.get("user_metadata");
                    String fullName = null;
                    if (userMetadata != null) {
                        fullName = (String) userMetadata.get("full_name");
                    }
                    if (fullName == null || fullName.trim().isEmpty()) {
                        fullName = email.split("@")[0];
                    }

                    // Check if user exists locally
                    Optional<User> userOpt = userRepository.findByEmail(email);
                    User user;
                    if (userOpt.isEmpty()) {
                        // Create a unique username
                        String baseUsername = email.split("@")[0];
                        String username = baseUsername;
                        int count = 1;
                        while (userRepository.findByUsername(username).isPresent()) {
                            username = baseUsername + count;
                            count++;
                        }
                        
                        user = new User();
                        user.setEmail(email);
                        user.setUsername(username);
                        user.setFullName(fullName);
                        user.setRole("ROLE_USER");
                        user.setEnabled(true);
                        user.setPassword("$2a$10$dummyBcryptHashForSupabaseUsersSoTheyCannotLoginWithLocalPassword");
                        user = userRepository.save(user);
                    } else {
                        user = userOpt.get();
                        // Update full name if it has changed in Supabase metadata
                        if (userMetadata != null && userMetadata.get("full_name") != null) {
                            String newName = (String) userMetadata.get("full_name");
                            if (!newName.equals(user.getFullName())) {
                                user.setFullName(newName);
                                userRepository.save(user);
                            }
                        }
                    }

                    // Authenticate using the local username to ensure 100% compatibility with other controllers
                    UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                            user.getUsername(), null,
                            Collections.singletonList(new SimpleGrantedAuthority(user.getRole()))
                        );
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } catch (Exception e) {
                    logger.error("Error processing Supabase token validation and sync", e);
                }
            }
        }

        chain.doFilter(req, res);
    }

    private String extractTokenFromCookie(HttpServletRequest req) {
        if (req.getCookies() == null) return null;
        return Arrays.stream(req.getCookies())
                .filter(c -> "auth_token".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}
