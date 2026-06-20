package com.indiantravelai.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Bookmark {
    private Long id;
    private Long userId;
    private Long destinationId;

    public Bookmark() {}

    public Bookmark(Long userId, Long destinationId) {
        this.userId = userId;
        this.destinationId = destinationId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getDestinationId() { return destinationId; }
    public void setDestinationId(Long destinationId) { this.destinationId = destinationId; }
}
