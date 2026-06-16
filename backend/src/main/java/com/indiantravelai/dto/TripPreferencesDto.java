package com.indiantravelai.dto;

public class TripPreferencesDto {
    private String travelMode;
    private Integer groupSize;
    private String transportMode;
    private String startLocation;

    public TripPreferencesDto() {}

    public TripPreferencesDto(String travelMode, Integer groupSize, String transportMode, String startLocation) {
        this.travelMode = travelMode;
        this.groupSize = groupSize;
        this.transportMode = transportMode;
        this.startLocation = startLocation;
    }

    public String getTravelMode() { return travelMode; }
    public void setTravelMode(String travelMode) { this.travelMode = travelMode; }

    public Integer getGroupSize() { return groupSize; }
    public void setGroupSize(Integer groupSize) { this.groupSize = groupSize; }

    public String getTransportMode() { return transportMode; }
    public void setTransportMode(String transportMode) { this.transportMode = transportMode; }

    public String getStartLocation() { return startLocation; }
    public void setStartLocation(String startLocation) { this.startLocation = startLocation; }
}
