package com.indiantravelai.controller;

import com.indiantravelai.dto.RouteRequestDto;
import com.indiantravelai.dto.RouteResponseDto;
import com.indiantravelai.service.RouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@RestController
@RequestMapping("/api/route")
public class RouteController {

    @Autowired
    private RouteService routeService;

    @PostMapping("/shortest")
    public ResponseEntity<RouteResponseDto> getShortestRoute(@RequestBody RouteRequestDto dto, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(routeService.getShortestRoute(principal.getName(), dto.getPlaceIds()));
    }

    @PostMapping("/scenic")
    public ResponseEntity<RouteResponseDto> getScenicRoute(@RequestBody RouteRequestDto dto, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(routeService.getScenicRoute(principal.getName(), dto.getPlaceIds()));
    }
}
