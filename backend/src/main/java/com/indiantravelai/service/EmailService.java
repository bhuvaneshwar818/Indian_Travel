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

    public void sendTripInvitationEmail(String toEmail, String inviterUsername, String tripTitle) {
        String subject = "You are Invited to Join a Travel Team on Indian Travel AI!";
        String dashboardUrl = "http://localhost:5173/";
        String htmlContent = "<div style=\"font-family: Arial, sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; background-color: #ffffff; color: #1e293b;\">" +
                "<h2 style=\"color: #4F46E5; margin-bottom: 10px;\">You've Been Invited!</h2>" +
                "<p style=\"font-size: 15px; line-height: 1.6;\">Hi there,</p>" +
                "<p style=\"font-size: 15px; line-height: 1.6;\"><strong>@" + inviterUsername + "</strong> has invited you to join their travel plan: <strong>" + tripTitle + "</strong> on Indian Travel AI.</p>" +
                "<p style=\"font-size: 15px; line-height: 1.6;\">To accept this invitation and begin tracking locations in real-time, click the button below to go to your dashboard, log in or sign up, and navigate to the <strong>Live Tracking</strong> workspace!</p>" +
                "<div style=\"margin: 25px 0; text-align: center;\">" +
                "  <a href=\"" + dashboardUrl + "\" style=\"display: inline-block; background-color: #4F46E5; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 14px; shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);\">Go to Travel Dashboard</a>" +
                "</div>" +
                "<p style=\"font-size: 13px; color: #64748b; line-height: 1.6;\">If the button above does not work, copy and paste the following link into your browser: <br><a href=\"" + dashboardUrl + "\" style=\"color: #4F46E5;\">" + dashboardUrl + "</a></p>" +
                "<hr style=\"border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;\">" +
                "<p style=\"font-size: 12px; color: #94a3b8;\">Best regards,<br>The Indian Travel AI Team</p>" +
                "</div>";

        sendEmailViaResend(toEmail, subject, htmlContent);
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
