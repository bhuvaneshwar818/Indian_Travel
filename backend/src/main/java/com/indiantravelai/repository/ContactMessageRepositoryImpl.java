package com.indiantravelai.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.indiantravelai.config.SupabaseRestClient;
import com.indiantravelai.entity.ContactMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Repository
@Service
public class ContactMessageRepositoryImpl {

    private static final String TABLE = "contact_messages";

    @Autowired
    private SupabaseRestClient client;

    @Autowired
    private ObjectMapper mapper;

    private final ObjectMapper snakeCaseMapper = new ObjectMapper()
            .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    public ContactMessage save(ContactMessage msg) {
        Map<String, Object> data = snakeCaseMapper.convertValue(msg, Map.class);

        if (msg.getId() == null) {
            data.remove("id");
            Map<String, Object> result = client.insert(TABLE, data);
            return snakeCaseMapper.convertValue(result, ContactMessage.class);
        } else {
            client.delete(TABLE, SupabaseRestClient.eq("id", msg.getId()));
            data.remove("id");
            Map<String, Object> result = client.insert(TABLE, data);
            return snakeCaseMapper.convertValue(result, ContactMessage.class);
        }
    }

    public long count() {
        List<Map<String, Object>> results = client.select(TABLE, "id", null);
        return results.size();
    }
}
