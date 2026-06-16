package com.indiantravelai.dto;

import java.util.List;

public class RouteResponseDto {
    private String totalDistance;
    private String totalDuration;
    private String polyline; // Encoded polyline path for map rendering
    private List<String> stops;

    public RouteResponseDto() {}

    public RouteResponseDto(String totalDistance, String totalDuration, String polyline, List<String> stops) {
        this.totalDistance = totalDistance;
        this.totalDuration = totalDuration;
        this.polyline = polyline;
        this.stops = stops;
    }

    public String getTotalDistance() { return totalDistance; }
    public void setTotalDistance(String totalDistance) { this.totalDistance = totalDistance; }

    public String getTotalDuration() { return totalDuration; }
    public void setTotalDuration(String totalDuration) { this.totalDuration = totalDuration; }

    public String getPolyline() { return polyline; }
    public void setPolyline(String polyline) { this.polyline = polyline; }

    public List<String> getStops() { return stops; }
    public void setStops(List<String> stops) { this.stops = stops; }
}
