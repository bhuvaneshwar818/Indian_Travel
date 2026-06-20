package com.indiantravelai.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.indiantravelai.config.SupabaseRestClient;
import com.indiantravelai.entity.Trip;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@Service
public class TripRepositoryImpl {

    private static final String TABLE = "trips";

    @Autowired
    private SupabaseRestClient client;

    @Autowired
    private ObjectMapper mapper;

    private final ObjectMapper snakeCaseMapper = new ObjectMapper()
            .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    public List<Trip> findAll() {
        List<Map<String, Object>> results = client.select(TABLE, "*");
        return results.stream()
                .map(m -> snakeCaseMapper.convertValue(m, Trip.class))
                .toList();
    }

    public Optional<Trip> findById(Long id) {
        List<Map<String, Object>> results = client.select(TABLE, "*", SupabaseRestClient.eq("id", id));
        return results.isEmpty() ? Optional.empty()
                : Optional.of(snakeCaseMapper.convertValue(results.get(0), Trip.class));
    }

    public List<Trip> findByUserUsernameOrderByCreatedAtDesc(String username) {
        List<Map<String, Object>> users = client.select("users", "id", SupabaseRestClient.eq("username", username));
        if (users.isEmpty()) return List.of();
        Long userId = toLong(users.get(0).get("id"));
        return findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Trip> findByUserIdOrderByCreatedAtDesc(Long userId) {
        String filter = SupabaseRestClient.eq("user_id", userId) + "&order=created_at.desc";
        List<Map<String, Object>> results = client.select(TABLE, "*", filter);
        return results.stream()
                .map(m -> snakeCaseMapper.convertValue(m, Trip.class))
                .toList();
    }

    public Trip save(Trip trip) {
        Map<String, Object> data = snakeCaseMapper.convertValue(trip, Map.class);

        if (trip.getId() == null) {
            data.remove("id");
            Map<String, Object> result = client.insert(TABLE, data);
            return snakeCaseMapper.convertValue(result, Trip.class);
        } else {
            client.delete(TABLE, SupabaseRestClient.eq("id", trip.getId()));
            data.remove("id");
            Map<String, Object> result = client.insert(TABLE, data);
            return snakeCaseMapper.convertValue(result, Trip.class);
        }
    }

    public void delete(Trip trip) {
        client.delete(TABLE, SupabaseRestClient.eq("id", trip.getId()));
    }

    public long count() {
        List<Map<String, Object>> results = client.select(TABLE, "id", null);
        return results.size();
    }

    private Long toLong(Object val) {
        if (val == null) return null;
        if (val instanceof Number) return ((Number) val).longValue();
        return Long.parseLong(val.toString());
    }
}
