package com.indiantravelai.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.indiantravelai.config.SupabaseRestClient;
import com.indiantravelai.entity.Review;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Repository
@Service
public class ReviewRepositoryImpl {

    private static final String TABLE = "reviews";

    @Autowired
    private SupabaseRestClient client;

    @Autowired
    private ObjectMapper mapper;

    private final ObjectMapper snakeCaseMapper = new ObjectMapper()
            .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    public List<Review> findAll() {
        List<Map<String, Object>> results = client.select(TABLE, "*");
        return results.stream()
                .map(m -> snakeCaseMapper.convertValue(m, Review.class))
                .toList();
    }

    public Review save(Review review) {
        Map<String, Object> data = snakeCaseMapper.convertValue(review, Map.class);

        if (review.getId() == null) {
            data.remove("id");
            Map<String, Object> result = client.insert(TABLE, data);
            return snakeCaseMapper.convertValue(result, Review.class);
        } else {
            client.delete(TABLE, SupabaseRestClient.eq("id", review.getId()));
            data.remove("id");
            Map<String, Object> result = client.insert(TABLE, data);
            return snakeCaseMapper.convertValue(result, Review.class);
        }
    }

    public long count() {
        List<Map<String, Object>> results = client.select(TABLE, "id", null);
        return results.size();
    }
}
