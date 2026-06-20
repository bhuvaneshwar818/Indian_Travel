package com.indiantravelai.service;

import com.indiantravelai.entity.Review;
import com.indiantravelai.repository.ReviewRepositoryImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepositoryImpl reviewRepository;

    public List<Review> getAll() {
        return reviewRepository.findAll();
    }

    public Review addReview(Review review) {
        if (review.getUserAvatar() == null || review.getUserAvatar().isBlank()) {
            review.setUserAvatar("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"); // default modern avatar
        }
        return reviewRepository.save(review);
    }
}
