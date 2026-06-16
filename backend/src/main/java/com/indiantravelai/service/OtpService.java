package com.indiantravelai.service;

import com.indiantravelai.entity.OtpToken;
import com.indiantravelai.repository.OtpTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    @Autowired
    private OtpTokenRepository otpTokenRepository;

    @Transactional
    public void requestOtp(String email, String code) {
        log.info("[LOG] OTP request received for email: {}", email);
        log.info("[LOG] OTP generated: {}", code);

        LocalDateTime now = LocalDateTime.now();
        Optional<OtpToken> tokenOpt = otpTokenRepository.findByEmail(email);

        OtpToken token;
        if (tokenOpt.isEmpty()) {
            token = new OtpToken(email, code, now.plusMinutes(5), now);
            log.info("[LOG] Creating new OTP record in database for email: {}", email);
        } else {
            token = tokenOpt.get();

            // 10 minutes rate limit window check
            if (now.isAfter(token.getRequestCountResetTime())) {
                token.setRequestCount(0);
                token.setRequestCountResetTime(now.plusMinutes(10));
            }

            if (token.getRequestCount() >= 3) {
                log.warn("[LOG] Rate limit exceeded: Too many OTP requests for email: {}", email);
                throw new RuntimeException("Too many OTP requests. Please wait before trying again.");
            }

            // resend cooldown check (minimum 60 seconds)
            if (token.getLastRequestedTime() != null && now.isBefore(token.getLastRequestedTime().plusSeconds(60))) {
                log.warn("[LOG] Cooldown violation: OTP request too frequent for email: {}", email);
                throw new RuntimeException("Please wait 60 seconds before requesting another OTP.");
            }

            token.setCode(code);
            token.setExpiryTime(now.plusMinutes(5));
            token.setFailedAttempts(0);
            token.setLastRequestedTime(now);
            token.setRequestCount(token.getRequestCount() + 1);
            token.setVerified(false);
            token.setVerifiedAt(null);
            log.info("[LOG] Updating existing OTP record in database for email: {}", email);
        }

        otpTokenRepository.save(token);
        log.info("[LOG] OTP saved to database for email: {}", email);
    }

    @Transactional
    public void verifyOtp(String email, String code) {
        log.info("[LOG] OTP verification request received for email: {}", email);

        LocalDateTime now = LocalDateTime.now();
        OtpToken token = otpTokenRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("[LOG] Verification failed: No active OTP record found for email: {}", email);
                    return new RuntimeException("No active OTP request found for this email.");
                });

        if (token.getCode() == null || token.getCode().trim().isEmpty() || token.isVerified()) {
            log.warn("[LOG] Verification failed: No active OTP code found or already verified for email: {}", email);
            throw new RuntimeException("No active OTP request found for this email.");
        }

        if (now.isAfter(token.getExpiryTime())) {
            log.warn("[LOG] Verification failed: OTP expired for email: {}", email);
            otpTokenRepository.delete(token);
            throw new RuntimeException("OTP expired");
        }

        if (token.getFailedAttempts() >= 3) {
            log.warn("[LOG] Verification failed: Max verification attempts exceeded for email: {}", email);
            otpTokenRepository.delete(token);
            throw new RuntimeException("OTP attempts exceeded. Please request a new OTP.");
        }

        if (!token.getCode().equals(code)) {
            token.setFailedAttempts(token.getFailedAttempts() + 1);
            otpTokenRepository.save(token);

            log.warn("[LOG] Verification failed: Invalid OTP code provided for email: {}. Failed attempts: {}", email, token.getFailedAttempts());

            if (token.getFailedAttempts() >= 3) {
                otpTokenRepository.delete(token);
                throw new RuntimeException("OTP attempts exceeded. Please request a new OTP.");
            }
            throw new RuntimeException("Invalid OTP");
        }

        // Successfully verified
        token.setVerified(true);
        token.setVerifiedAt(now);
        token.setCode(""); // consume/invalidate the code so it cannot be reused
        token.setFailedAttempts(0);
        otpTokenRepository.save(token);

        log.info("[LOG] Verification success: OTP verified successfully for email: {}", email);
    }

    @Transactional(readOnly = true)
    public boolean isEmailVerified(String email) {
        Optional<OtpToken> tokenOpt = otpTokenRepository.findByEmail(email);
        if (tokenOpt.isEmpty()) {
            return false;
        }

        OtpToken token = tokenOpt.get();
        if (!token.isVerified() || token.getVerifiedAt() == null) {
            return false;
        }

        // Verification is valid for 15 minutes to complete registration
        if (LocalDateTime.now().isAfter(token.getVerifiedAt().plusMinutes(15))) {
            return false;
        }

        return true;
    }

    @Transactional
    public void consumeVerification(String email) {
        otpTokenRepository.findByEmail(email).ifPresent(token -> {
            otpTokenRepository.delete(token);
            log.info("[LOG] Verification consumed and database token record deleted for email: {}", email);
        });
    }
}
