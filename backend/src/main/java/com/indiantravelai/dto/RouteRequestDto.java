package com.indiantravelai.dto;

import java.util.List;

public class RouteRequestDto {
    private List<Long> placeIds;

    public RouteRequestDto() {}

    public RouteRequestDto(List<Long> placeIds) {
        this.placeIds = placeIds;
    }

    public List<Long> getPlaceIds() { return placeIds; }
    public void setPlaceIds(List<Long> placeIds) { this.placeIds = placeIds; }
}
