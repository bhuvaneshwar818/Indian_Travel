package com.indiantravelai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${resend.api.key:}")
    private String resendApiKey;

    @Value("${resend.from.email:noreply@thedarkroom.in}")
    private String fromEmail;

    public void sendVerificationEmail(String email, String code) {
        String subject = "Verify Your Indian Travel AI Account";
        String htmlContent = "<div style=\"font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;\">" +
                "<h2 style=\"color: #4F46E5;\">Welcome to Indian Travel AI!</h2>" +
                "<p>Thank you for signing up. Please verify your email address using the one-time password (OTP) below:</p>" +
                "<div style=\"font-size: 24px; font-weight: bold; background-color: #F3F4F6; padding: 15px; text-align: center; border-radius: 5px; letter-spacing: 5px; color: #1F2937; margin: 20px 0;\">" + code + "</div>" +
                "<p>This code will expire in <strong>5 minutes</strong>. If you did not request this code, please ignore this email.</p>" +
                "<br><p>Best regards,<br>The Indian Travel AI Team</p>" +
                "</div>";

        sendEmailViaResend(email, subject, htmlContent);
    }

    public void sendPasswordResetEmail(String email, String token) {
        String subject = "Reset Your Indian Travel AI Password";
        String htmlContent = "<div style=\"font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;\">" +
                "<h2 style=\"color: #4F46E5;\">Password Reset Request</h2>" +
                "<p>You requested to reset your password. Use the token below to complete the reset process:</p>" +
                "<div style=\"font-size: 20px; font-weight: bold; background-color: #F3F4F6; padding: 15px; text-align: center; border-radius: 5px; color: #1F2937; margin: 20px 0;\">" + token + "</div>" +
                "<p>If you did not request a password reset, please ignore this email.</p>" +
                "<br><p>Best regards,<br>The Indian Travel AI Team</p>" +
                "</div>";

        sendEmailViaResend(email, subject, htmlContent);
    }

    public void sendUsernameRecoveryEmail(String email, String username) {
        String subject = "Recover Your Indian Travel AI Username";
        String htmlContent = "<div style=\"font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;\">" +
                "<h2 style=\"color: #4F46E5;\">Username Recovery</h2>" +
                "<p>You requested to recover your username. Your registered username is:</p>" +
                "<div style=\"font-size: 20px; font-weight: bold; background-color: #F3F4F6; padding: 15px; text-align: center; border-radius: 5px; color: #1F2937; margin: 20px 0;\">" + username + "</div>" +
                "<p>You can now use this username to log in to your account.</p>" +
                "<br><p>Best regards,<br>The Indian Travel AI Team</p>" +
                "</div>";

        sendEmailViaResend(email, subject, htmlContent);
    }

    private void sendEmailViaResend(String toEmail, String subject, String htmlContent) {
        log.info("[LOG] Email sending started to: {}", toEmail);

        // Check if a valid Resend key is provided (excluding default placeholders)
        boolean hasResendKey = resendApiKey != null && !resendApiKey.trim().isEmpty()
                && !resendApiKey.contains("placeholder") && !resendApiKey.contains("default");

        if (!hasResendKey) {
            log.warn("[LOG] Resend API key is not configured. Falling back to stdout print log.");
            System.out.println("=================================================");
            System.out.println("SIMULATED EMAIL DISPATCH:");
            System.out.println("FROM: Indian Travel AI <" + fromEmail + ">");
            System.out.println("TO: " + toEmail);
            System.out.println("SUBJECT: " + subject);
            System.out.println("HTML CONTENT:\n" + htmlContent);
            System.out.println("=================================================");
            log.info("[LOG] Email sent success (Simulated Fallback) to: {}", toEmail);
            return;
        }

        try {
            String url = "https://api.resend.com/emails";

            // Prepare Request Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + resendApiKey.trim());

            // Prepare JSON Payload Map
            Map<String, Object> payload = new HashMap<>();
            payload.put("from", "Indian Travel AI <" + fromEmail.trim() + ">");
            payload.put("to", Collections.singletonList(toEmail.trim()));
            payload.put("subject", subject);
            payload.put("html", htmlContent);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);

            log.info("[LOG] Hitting Resend REST API URL: {}", url);
            log.info("[LOG] Resend Payload: {}", payload);

            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);

            log.info("[LOG] Resend API response. Status: {}, Body: {}", response.getStatusCode(), response.getBody());

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("[LOG] Email sent success: Verified delivery to: {}", toEmail);
            } else {
                log.error("[LOG] Email sent failure: Resend responded with status code: {}", response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("[LOG] Email sent failure: Resend API integration failed: {}", e.getMessage(), e);
        }
    }
}
