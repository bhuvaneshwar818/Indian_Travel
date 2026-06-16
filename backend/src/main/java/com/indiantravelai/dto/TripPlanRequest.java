package com.indiantravelai.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class TripPlanRequest {
    @NotBlank
    private String state;

    @NotBlank
    private String category; // Temples, Beaches, Historical, Food, Adventure

    @NotBlank
    private String budget; // Budget, Moderate, Luxury

    @Min(1)
    @Max(10)
    private int duration; // 1 to 10 days

    public TripPlanRequest() {}

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getBudget() { return budget; }
    public void setBudget(String budget) { this.budget = budget; }

    public int getDuration() { return duration; }
    public void setDuration(int duration) { this.duration = duration; }
}
