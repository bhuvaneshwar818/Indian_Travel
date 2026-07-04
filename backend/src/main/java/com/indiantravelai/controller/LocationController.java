package com.indiantravelai.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class LocationController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // In-memory registry to store location updates: tripId -> (username -> locationDetailsMap)
    private final Map<Long, Map<String, Map<String, Object>>> tripLocations = new ConcurrentHashMap<>();

    // Map to link sessionId -> username
    private final Map<String, String> sessionUsernames = new ConcurrentHashMap<>();
    // Map to link sessionId -> tripId
    private final Map<String, Long> sessionTripIds = new ConcurrentHashMap<>();

    @MessageMapping("/location/{tripId}")
    @SendTo("/topic/location/{tripId}")
    public Map<String, Map<String, Object>> handleLocationUpdate(
            @DestinationVariable Long tripId,
            Map<String, Object> payload,
            SimpMessageHeaderAccessor headerAccessor) {

        String username = (String) payload.get("username");
        if (username == null || username.trim().isEmpty()) {
            return tripLocations.getOrDefault(tripId, new HashMap<>());
        }

        String sessionId = headerAccessor.getSessionId();
        if (sessionId != null) {
            sessionUsernames.put(sessionId, username);
            sessionTripIds.put(sessionId, tripId);
        }

        Boolean isActive = (Boolean) payload.get("isActive");
        Double lat = toDouble(payload.get("lat"));
        Double lng = toDouble(payload.get("lng"));

        Map<String, Map<String, Object>> membersMap = tripLocations.computeIfAbsent(tripId, k -> new ConcurrentHashMap<>());

        if (Boolean.FALSE.equals(isActive)) {
            // Explicitly set inactive (Remove completely)
            membersMap.remove(username);
        } else {
            // Add/Update user tracking
            Map<String, Object> details = new HashMap<>();
            details.put("username", username);
            details.put("fullName", payload.getOrDefault("fullName", username));
            details.put("lat", lat);
            details.put("lng", lng);
            details.put("lastUpdated", LocalDateTime.now().toString());
            details.put("isActive", true);
            membersMap.put(username, details);
        }

        return membersMap;
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        String username = sessionUsernames.remove(sessionId);
        Long tripId = sessionTripIds.remove(sessionId);

        if (username != null && tripId != null) {
            Map<String, Map<String, Object>> membersMap = tripLocations.get(tripId);
            if (membersMap != null) {
                membersMap.remove(username);
                // Broadcast the updated online list to the trip subscribers
                messagingTemplate.convertAndSend("/topic/location/" + tripId, membersMap);
            }
        }
    }

    private Double toDouble(Object val) {
        if (val == null) return null;
        if (val instanceof Number) return ((Number) val).doubleValue();
        try {
            return Double.parseDouble(val.toString());
        } catch (Exception e) {
            return null;
        }
    }
}
