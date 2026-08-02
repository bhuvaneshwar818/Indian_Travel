package com.indiantravelai.service;

import com.indiantravelai.dto.JwtResponse;
import com.indiantravelai.dto.LoginRequest;
import com.indiantravelai.dto.OtpVerifyRequest;
import com.indiantravelai.dto.SignupRequest;
import com.indiantravelai.entity.User;
import com.indiantravelai.repository.UserRepositoryImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceUnitTest {

    @Mock
    private UserRepositoryImpl userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        // common setup if needed
    }

    @Test
    void registerUser_success_shouldSaveUserAndSendEmail() {
        SignupRequest req = new SignupRequest();
        req.setUsername("testuser");
        req.setEmail("test@example.com");
        req.setPassword("Secret123!");
        req.setFullName("Test User");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("encodedpwd");

        String message = authService.registerUser(req);

        assertNotNull(message);
        verify(userRepository, times(1)).save(any(User.class));
        verify(emailService, times(1)).sendVerificationEmail(eq("test@example.com"), anyString());
    }

    @Test
    void verifyEmail_withValidCode_shouldEnableUser() {
        OtpVerifyRequest req = new OtpVerifyRequest();
        req.setEmail("user2@example.com");
        req.setCode("123456");

        User user = new User();
        user.setEmail("user2@example.com");
        user.setVerificationToken("123456");
        user.setEnabled(false);

        when(userRepository.findByEmail("user2@example.com")).thenReturn(Optional.of(user));

        String res = authService.verifyEmail(req);

        assertTrue(user.isEnabled());
        assertNull(user.getVerificationToken());
        verify(userRepository, times(1)).save(user);
        assertNotNull(res);
    }

    @Test
    void loginUser_withValidCredentials_shouldReturnJwtResponse() {
        LoginRequest req = new LoginRequest();
        req.setUsername("testuser");
        req.setPassword("Secret123!");

        User user = new User();
        user.setUsername("testuser");
        user.setPassword("encodedpwd");
        user.setEnabled(true);
        user.setEmail("test@example.com");
        user.setFullName("Test User");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Secret123!", "encodedpwd")).thenReturn(true);
        when(tokenProvider.generateToken("testuser")).thenReturn("dummy-jwt");

        JwtResponse resp = authService.loginUser(req);

        assertNotNull(resp);
        assertEquals("dummy-jwt", resp.getToken());
    }
}
