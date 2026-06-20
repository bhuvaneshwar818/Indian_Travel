package com.indiantravelai.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.indiantravelai.config.SupabaseRestClient;
import com.indiantravelai.entity.OtpToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
@Service
public class OtpTokenRepositoryImpl {

    private static final String TABLE = "otp_tokens";

    @Autowired
    private SupabaseRestClient client;

    @Autowired
    private ObjectMapper mapper;

    private final ObjectMapper snakeCaseMapper = new ObjectMapper()
            .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    public Optional<OtpToken> findByEmail(String email) {
        List<Map<String, Object>> results = client.select(TABLE, "*", SupabaseRestClient.eq("email", email));
        return results.isEmpty() ? Optional.empty()
                : Optional.of(snakeCaseMapper.convertValue(results.get(0), OtpToken.class));
    }

    public OtpToken save(OtpToken token) {
        Map<String, Object> data = snakeCaseMapper.convertValue(token, Map.class);
        data.remove("id");

        if (token.getId() != null) {
            client.delete(TABLE, SupabaseRestClient.eq("id", token.getId()));
        }

        Map<String, Object> result = client.insert(TABLE, data);
        return snakeCaseMapper.convertValue(result, OtpToken.class);
    }

    public void delete(OtpToken token) {
        client.delete(TABLE, SupabaseRestClient.eq("id", token.getId()));
    }

    public long count() {
        List<Map<String, Object>> results = client.select(TABLE, "id", null);
        return results.size();
    }
}
