package com.indiantravelai.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.indiantravelai.config.SupabaseRestClient;
import com.indiantravelai.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
@Service
public class UserRepositoryImpl {

    private static final String TABLE = "users";

    @Autowired
    private SupabaseRestClient client;

    @Autowired
    private ObjectMapper mapper;

    private final ObjectMapper snakeCaseMapper = new ObjectMapper()
            .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    public Optional<User> findByUsername(String username) {
        List<Map<String, Object>> results = client.select(TABLE, "*", SupabaseRestClient.eq("username", username));
        return results.isEmpty() ? Optional.empty()
                : Optional.of(snakeCaseMapper.convertValue(results.get(0), User.class));
    }

    public Optional<User> findByEmail(String email) {
        List<Map<String, Object>> results = client.select(TABLE, "*", SupabaseRestClient.eq("email", email));
        return results.isEmpty() ? Optional.empty()
                : Optional.of(snakeCaseMapper.convertValue(results.get(0), User.class));
    }

    public Optional<User> findByVerificationToken(String token) {
        List<Map<String, Object>> results = client.select(TABLE, "*", SupabaseRestClient.eq("verification_token", token));
        return results.isEmpty() ? Optional.empty()
                : Optional.of(snakeCaseMapper.convertValue(results.get(0), User.class));
    }

    public Optional<User> findByResetPasswordToken(String token) {
        List<Map<String, Object>> results = client.select(TABLE, "*", SupabaseRestClient.eq("reset_password_token", token));
        return results.isEmpty() ? Optional.empty()
                : Optional.of(snakeCaseMapper.convertValue(results.get(0), User.class));
    }

    public Optional<User> findById(Long id) {
        List<Map<String, Object>> results = client.select(TABLE, "*", SupabaseRestClient.eq("id", id));
        return results.isEmpty() ? Optional.empty()
                : Optional.of(snakeCaseMapper.convertValue(results.get(0), User.class));
    }

    public Optional<User> findByUsernameOrEmail(String username, String email) {
        Optional<User> byUsername = findByUsername(username);
        if (byUsername.isPresent()) return byUsername;
        return findByEmail(email);
    }

    public User save(User user) {
        Map<String, Object> data = snakeCaseMapper.convertValue(user, Map.class);

        if (user.getId() == null) {
            data.remove("id");
            Map<String, Object> result = client.insert(TABLE, data);
            return snakeCaseMapper.convertValue(result, User.class);
        } else {
            client.delete(TABLE, SupabaseRestClient.eq("id", user.getId()));
            data.remove("id");
            Map<String, Object> result = client.insert(TABLE, data);
            return snakeCaseMapper.convertValue(result, User.class);
        }
    }

    public long count() {
        List<Map<String, Object>> results = client.select(TABLE, "id", null);
        return results.size();
    }
}
