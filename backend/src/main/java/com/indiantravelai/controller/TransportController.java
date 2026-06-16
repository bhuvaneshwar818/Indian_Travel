package com.indiantravelai.controller;

import com.indiantravelai.service.TransportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transport")
public class TransportController {

    @Autowired
    private TransportService transportService;

    @GetMapping("/timings")
    public ResponseEntity<List<Map<String, Object>>> getTransportTimings(
            @RequestParam(required = false, defaultValue = "Mumbai") String from,
            @RequestParam(required = false, defaultValue = "Goa") String to,
            Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(transportService.getTransportTimings(from, to));
    }
}
