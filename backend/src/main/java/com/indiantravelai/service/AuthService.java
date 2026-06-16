package com.indiantravelai.service;

import com.indiantravelai.config.JwtTokenProvider;
import com.indiantravelai.dto.*;
import com.indiantravelai.entity.User;
import com.indiantravelai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private EmailService emailService;

    public String registerUser(SignupRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username is already taken!");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already registered!");
        }

        // Create User (default enabled = true for ease of use, but we generate OTP to show OTP flow)
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole("ROLE_USER");
        
        // Generate a 6-digit numerical OTP code
        String otpCode = String.format("%06d", (int)(Math.random() * 1000000));
        user.setVerificationToken(otpCode);
        user.setEnabled(false); // require OTP verification to activate!

        userRepository.save(user);

        // Send OTP email
        emailService.sendVerificationEmail(user.getEmail(), otpCode);

        return "User registered successfully! An OTP has been sent to your email.";
    }

    public String verifyEmail(OtpVerifyRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found!");
        }

        User user = userOpt.get();
        if (user.getVerificationToken() != null && user.getVerificationToken().equals(request.getCode())) {
            user.setEnabled(true);
            user.setVerificationToken(null);
            userRepository.save(user);
            return "Email verified successfully! You can now log in.";
        } else {
            throw new RuntimeException("Invalid OTP code!");
        }
    }

    public JwtResponse loginUser(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isEmpty()) {
            // Fallback to checking email
            userOpt = userRepository.findByEmail(request.getUsername());
        }

        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid username or password!");
        }

        User user = userOpt.get();
        if (!user.isEnabled()) {
            throw new RuntimeException("Please verify your email before logging in. An OTP was sent during signup.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password!");
        }

        String jwt = tokenProvider.generateToken(user.getUsername());
        return new JwtResponse(jwt, user.getUsername(), user.getEmail(), user.getFullName(), user.getRole());
    }

    public String forgotPassword(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("No account found with this email!");
        }

        User user = userOpt.get();
        String token = UUID.randomUUID().toString().substring(0, 8).toUpperCase(); // Short, easy-to-type token
        user.setResetPasswordToken(token);
        userRepository.save(user);

        emailService.sendPasswordResetEmail(user.getEmail(), token);

        return "Password reset token sent to your email.";
    }

    public String resetPassword(ResetPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByResetPasswordToken(request.getToken());
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid or expired password reset token!");
        }

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        userRepository.save(user);

        return "Password reset successfully! You can now log in.";
    }

    public String forgotUsername(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("No account found with this email!");
        }

        User user = userOpt.get();
        emailService.sendUsernameRecoveryEmail(user.getEmail(), user.getUsername());

        return "Username recovery email has been sent.";
    }
}
