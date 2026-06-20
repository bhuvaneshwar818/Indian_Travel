package com.indiantravelai.controller;

import com.indiantravelai.entity.Trip;
import com.indiantravelai.model.ChatMessage;
import com.indiantravelai.repository.ChatMessageRepositoryImpl;
import com.indiantravelai.repository.TripRepositoryImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class ChatController {

    @Autowired
    private ChatMessageRepositoryImpl chatMessageRepository;

    @Autowired
    private TripRepositoryImpl tripRepository;

    // WebSocket route for broadcasting group messages
    @MessageMapping("/chat/{tripId}")
    @SendTo("/topic/chat/{tripId}")
    public Map<String, Object> handleChatMessage(@DestinationVariable Long tripId, Map<String, String> payload) {
        String senderName = payload.getOrDefault("senderName", "Traveler");
        String messageText = payload.getOrDefault("message", "");

        Map<String, Object> response = new HashMap<>();
        response.put("senderName", senderName);
        response.put("message", messageText);
        response.put("sentAt", LocalDateTime.now().toString());

        try {
            Trip trip = tripRepository.findById(tripId).orElse(null);
            if (trip != null) {
                ChatMessage chat = new ChatMessage(tripId, senderName, messageText);
                chatMessageRepository.save(chat);
            }
        } catch (Exception e) {
            System.err.println("Failed to persist chat message: " + e.getMessage());
        }

        return response;
    }

    // REST route for loading historical chat logs
    @GetMapping("/api/chat/history/{tripId}")
    public ResponseEntity<List<ChatMessage>> getChatHistory(@PathVariable Long tripId, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        List<ChatMessage> history = chatMessageRepository.findByTripIdOrderBySentAtAsc(tripId);
        return ResponseEntity.ok(history);
    }
}
