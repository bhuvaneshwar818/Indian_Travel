package com.indiantravelai.model;

import com.indiantravelai.entity.Trip;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "wishlist_places")
public class WishlistPlace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(name = "place_name", nullable = false)
    private String placeName;

    private String state;
    private String category;
    private Double lat;
    private Double lng;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "added_at")
    private LocalDateTime addedAt = LocalDateTime.now();

    public WishlistPlace() {}

    public WishlistPlace(Trip trip, String placeName, String state, String category, Double lat, Double lng, Integer sortOrder) {
        this.trip = trip;
        this.placeName = placeName;
        this.state = state;
        this.category = category;
        this.lat = lat;
        this.lng = lng;
        this.sortOrder = sortOrder;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Trip getTrip() { return trip; }
    public void setTrip(Trip trip) { this.trip = trip; }

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
