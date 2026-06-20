package com.indiantravelai.controller;

import com.indiantravelai.entity.ContactMessage;
import com.indiantravelai.repository.ContactMessageRepositoryImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    @Autowired
    private ContactMessageRepositoryImpl contactMessageRepository;

    @PostMapping
    public ResponseEntity<?> submitMessage(@Valid @RequestBody ContactMessage message) {
        contactMessageRepository.save(message);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Thank you for contacting us! We will reply to your email shortly.");
        return ResponseEntity.ok(response);
    }
}
