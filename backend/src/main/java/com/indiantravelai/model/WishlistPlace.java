package com.indiantravelai.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@JsonIgnoreProperties(ignoreUnknown = true)
public class WishlistPlace {
    private Long id;
    private Long tripId;
    private String placeName;
    private String state;
    private String category;
    private Double lat;
    private Double lng;
    private Integer sortOrder = 0;
    private LocalDateTime addedAt = LocalDateTime.now();

    public WishlistPlace() {}

    public WishlistPlace(Long tripId, String placeName, String state, String category, Double lat, Double lng, Integer sortOrder) {
        this.tripId = tripId;
        this.placeName = placeName;
        this.state = state;
        this.category = category;
        this.lat = lat;
        this.lng = lng;
        this.sortOrder = sortOrder;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }

    public String getPlaceName() { return placeName; }
    public void setPlaceName(String placeName) { this.placeName = placeName; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public LocalDateTime getAddedAt() { return addedAt; }
    public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
}
