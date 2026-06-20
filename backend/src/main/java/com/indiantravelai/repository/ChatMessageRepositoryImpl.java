package com.indiantravelai.repository;

import com.indiantravelai.config.SupabaseRestClient;

import com.indiantravelai.model.ChatMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Repository
@Service
public class ChatMessageRepositoryImpl {

    private static final String TABLE = "chat_messages";

    @Autowired
    private SupabaseRestClient client;

    public List<ChatMessage> findByTripIdOrderBySentAtAsc(Long tripId) {
        String filter = SupabaseRestClient.eq("trip_id", tripId) + "&order=sent_at.asc";
        List<Map<String, Object>> results = client.select(TABLE, "*", filter);
        return results.stream().map(this::toEntity).toList();
    }

    public ChatMessage save(ChatMessage msg) {
        Map<String, Object> data = toMap(msg);

        if (msg.getId() == null) {
            Map<String, Object> result = client.insert(TABLE, data);
            return toEntity(result);
        } else {
            client.delete(TABLE, SupabaseRestClient.eq("id", msg.getId()));
            data.remove("id");
            Map<String, Object> result = client.insert(TABLE, data);
            return toEntity(result);
        }
    }

    private ChatMessage toEntity(Map<String, Object> map) {
        ChatMessage m = new ChatMessage();
        m.setId(toLong(map.get("id")));
        m.setTripId(toLong(map.get("trip_id")));
        m.setSenderName((String) map.get("sender_name"));
        m.setMessage((String) map.get("message"));
        m.setSentAt(map.get("sent_at") != null ? LocalDateTime.parse(map.get("sent_at").toString()) : null);
        return m;
    }

    private Map<String, Object> toMap(ChatMessage msg) {
        Map<String, Object> map = new LinkedHashMap<>();
        if (msg.getId() != null) map.put("id", msg.getId());
        if (msg.getTripId() != null) map.put("trip_id", msg.getTripId());
        map.put("sender_name", msg.getSenderName());
        map.put("message", msg.getMessage());
        map.put("sent_at", msg.getSentAt() != null ? msg.getSentAt().toString() : null);
        return map;
    }

    private Long toLong(Object val) {
        if (val == null) return null;
        if (val instanceof Number) return ((Number) val).longValue();
        return Long.parseLong(val.toString());
    }
}
