package com.indiantravelai.dto;

import jakarta.validation.constraints.NotBlank;

public class SessionRequestDto {

    @NotBlank(message = "Access token is required")
    private String accessToken;

    public SessionRequestDto() {}

    public SessionRequestDto(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
}
