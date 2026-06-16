package com.indiantravelai.controller;

import com.indiantravelai.service.TranslationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/translate")
public class TranslationController {

    @Autowired
    private TranslationService translationService;

    @PostMapping
    public ResponseEntity<?> translate(@RequestBody Map<String, String> request, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        
        String text = request.get("text");
        String targetLang = request.get("targetLang");

        String translated = translationService.translate(text, targetLang);
        Map<String, String> response = new HashMap<>();
        response.put("translatedText", translated);
        return ResponseEntity.ok(response);
    }
}
