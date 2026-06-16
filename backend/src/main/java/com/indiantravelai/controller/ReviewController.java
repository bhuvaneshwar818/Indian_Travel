package com.indiantravelai.controller;

import com.indiantravelai.entity.Review;
import com.indiantravelai.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAll());
    }

    @PostMapping
    public ResponseEntity<Review> submitReview(@RequestBody Review review) {
        Review saved = reviewService.addReview(review);
        return ResponseEntity.ok(saved);
    }
}
