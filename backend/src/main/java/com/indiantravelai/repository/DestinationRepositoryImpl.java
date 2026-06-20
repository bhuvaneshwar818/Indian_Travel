package com.indiantravelai.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.indiantravelai.config.SupabaseRestClient;
import com.indiantravelai.entity.Destination;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
@Service
public class DestinationRepositoryImpl {

    private static final String TABLE = "destinations";

    @Autowired
    private SupabaseRestClient client;

    @Autowired
    private ObjectMapper mapper;

    private final ObjectMapper snakeCaseMapper = new ObjectMapper()
            .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    public List<Destination> findAll() {
        List<Map<String, Object>> results = client.select(TABLE, "*");
        return results.stream()
                .map(m -> snakeCaseMapper.convertValue(m, Destination.class))
                .toList();
    }

    public Optional<Destination> findById(Long id) {
        List<Map<String, Object>> results = client.select(TABLE, "*", SupabaseRestClient.eq("id", id));
        return results.isEmpty() ? Optional.empty()
                : Optional.of(snakeCaseMapper.convertValue(results.get(0), Destination.class));
    }

    public List<Destination> findByStateIgnoreCase(String state) {
        List<Map<String, Object>> results = client.select(TABLE, "*", "state=ilike." + state);
        return results.stream()
                .map(m -> snakeCaseMapper.convertValue(m, Destination.class))
                .toList();
    }

    public List<Destination> findByCategoryIgnoreCase(String category) {
        List<Map<String, Object>> results = client.select(TABLE, "*", "category=ilike." + category);
        return results.stream()
                .map(m -> snakeCaseMapper.convertValue(m, Destination.class))
                .toList();
    }

    public List<Destination> findByStateIgnoreCaseAndCategoryIgnoreCase(String state, String category) {
        String filter = "state=ilike." + state + "&category=ilike." + category;
        List<Map<String, Object>> results = client.select(TABLE, "*", filter);
        return results.stream()
                .map(m -> snakeCaseMapper.convertValue(m, Destination.class))
                .toList();
    }

    public Destination save(Destination dest) {
        Map<String, Object> data = snakeCaseMapper.convertValue(dest, Map.class);

        if (dest.getId() == null) {
            data.remove("id");
            Map<String, Object> result = client.insert(TABLE, data);
            return snakeCaseMapper.convertValue(result, Destination.class);
        } else {
            client.delete(TABLE, SupabaseRestClient.eq("id", dest.getId()));
            data.remove("id");
            Map<String, Object> result = client.insert(TABLE, data);
            return snakeCaseMapper.convertValue(result, Destination.class);
        }
    }

    public long count() {
        List<Map<String, Object>> results = client.select(TABLE, "id", null);
        return results.size();
    }
}
