package com.indiantravelai.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@JsonIgnoreProperties(ignoreUnknown = true)
public class OtpToken {
    private Long id;
    private String email;
    private String code;
    private LocalDateTime expiryTime;
    private int failedAttempts = 0;
    private LocalDateTime lastRequestedTime;
    private int requestCount = 0;
    private LocalDateTime requestCountResetTime;
    private boolean verified = false;
    private LocalDateTime verifiedAt;

    public OtpToken() {}

    public OtpToken(String email, String code, LocalDateTime expiryTime, LocalDateTime now) {
        this.email = email;
        this.code = code;
        this.expiryTime = expiryTime;
        this.lastRequestedTime = now;
        this.requestCount = 1;
        this.requestCountResetTime = now.plusMinutes(10);
        this.failedAttempts = 0;
        this.verified = false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public LocalDateTime getExpiryTime() { return expiryTime; }
    public void setExpiryTime(LocalDateTime expiryTime) { this.expiryTime = expiryTime; }

    public int getFailedAttempts() { return failedAttempts; }
    public void setFailedAttempts(int failedAttempts) { this.failedAttempts = failedAttempts; }

    public LocalDateTime getLastRequestedTime() { return lastRequestedTime; }
    public void setLastRequestedTime(LocalDateTime lastRequestedTime) { this.lastRequestedTime = lastRequestedTime; }

    public int getRequestCount() { return requestCount; }
    public void setRequestCount(int requestCount) { this.requestCount = requestCount; }

    public LocalDateTime getRequestCountResetTime() { return requestCountResetTime; }
    public void setRequestCountResetTime(LocalDateTime requestCountResetTime) { this.requestCountResetTime = requestCountResetTime; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }
}
