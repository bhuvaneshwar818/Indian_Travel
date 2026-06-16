package com.indiantravelai.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "trips")
public class Trip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String title;
    private String state;
    private String category;
    private String budget; // Budget, Moderate, Luxury
    private int duration; // Days

    @Column(length = 10000)
    private String itineraryJson; // Store itinerary as JSON block for rich frontend rendering

    private double totalBudgetEstimate;
    private LocalDateTime createdAt = LocalDateTime.now();

    private String travelMode; // SOLO, GROUP
    private Integer groupSize;
    private String transportMode; // OWN_VEHICLE, PUBLIC
    private String startLocation;

    public Trip() {}

    public Trip(User user, String title, String state, String category, String budget, int duration, String itineraryJson, double totalBudgetEstimate) {
        this.user = user;
        this.title = title;
        this.state = state;
        this.category = category;
        this.budget = budget;
        this.duration = duration;
        this.itineraryJson = itineraryJson;
        this.totalBudgetEstimate = totalBudgetEstimate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getBudget() { return budget; }
    public void setBudget(String budget) { this.budget = budget; }

    public int getDuration() { return duration; }
    public void setDuration(int duration) { this.duration = duration; }

    public String getItineraryJson() { return itineraryJson; }
    public void setItineraryJson(String itineraryJson) { this.itineraryJson = itineraryJson; }

    public double getTotalBudgetEstimate() { return totalBudgetEstimate; }
    public void setTotalBudgetEstimate(double totalBudgetEstimate) { this.totalBudgetEstimate = totalBudgetEstimate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getTravelMode() { return travelMode; }
    public void setTravelMode(String travelMode) { this.travelMode = travelMode; }

    public Integer getGroupSize() { return groupSize; }
    public void setGroupSize(Integer groupSize) { this.groupSize = groupSize; }

    public String getTransportMode() { return transportMode; }
    public void setTransportMode(String transportMode) { this.transportMode = transportMode; }

    public String getStartLocation() { return startLocation; }
    public void setStartLocation(String startLocation) { this.startLocation = startLocation; }
}
