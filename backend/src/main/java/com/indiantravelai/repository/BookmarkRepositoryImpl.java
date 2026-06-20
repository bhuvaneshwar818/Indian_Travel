package com.indiantravelai.repository;

import com.indiantravelai.config.SupabaseRestClient;
import com.indiantravelai.entity.Bookmark;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
@Service
public class BookmarkRepositoryImpl {

    private static final String TABLE = "bookmarks";

    @Autowired
    private SupabaseRestClient client;

    public List<Bookmark> findByUserUsername(String username) {
        List<Map<String, Object>> users = client.select("users", "id", SupabaseRestClient.eq("username", username));
        if (users.isEmpty()) return List.of();
        Long userId = toLong(users.get(0).get("id"));
        List<Map<String, Object>> results = client.select(TABLE, "*", SupabaseRestClient.eq("user_id", userId));
        return results.stream().map(this::toEntity).toList();
    }

    public boolean existsByUserUsernameAndDestinationId(String username, Long destinationId) {
        List<Map<String, Object>> users = client.select("users", "id", SupabaseRestClient.eq("username", username));
        if (users.isEmpty()) return false;
        Long userId = toLong(users.get(0).get("id"));
        String filter = SupabaseRestClient.eq("user_id", userId) + "&" + SupabaseRestClient.eq("destination_id", destinationId);
        List<Map<String, Object>> results = client.select(TABLE, "id", filter);
        return !results.isEmpty();
    }

    public Bookmark save(Bookmark bookmark) {
        Map<String, Object> data = toMap(bookmark);

        if (bookmark.getId() == null) {
            Map<String, Object> result = client.insert(TABLE, data);
            return toEntity(result);
        } else {
            client.delete(TABLE, SupabaseRestClient.eq("id", bookmark.getId()));
            data.remove("id");
            Map<String, Object> result = client.insert(TABLE, data);
            return toEntity(result);
        }
    }

    public void deleteByUserUsernameAndDestinationId(String username, Long destinationId) {
        List<Map<String, Object>> users = client.select("users", "id", SupabaseRestClient.eq("username", username));
        if (users.isEmpty()) return;
        Long userId = toLong(users.get(0).get("id"));
        String filter = SupabaseRestClient.eq("user_id", userId) + "&" + SupabaseRestClient.eq("destination_id", destinationId);
        client.delete(TABLE, filter);
    }

    public long count() {
        List<Map<String, Object>> results = client.select(TABLE, "id", null);
        return results.size();
    }

    private Bookmark toEntity(Map<String, Object> map) {
        Bookmark b = new Bookmark();
        b.setId(toLong(map.get("id")));
        b.setUserId(toLong(map.get("user_id")));
        b.setDestinationId(toLong(map.get("destination_id")));
        return b;
    }

    private Map<String, Object> toMap(Bookmark bookmark) {
        Map<String, Object> map = new LinkedHashMap<>();
        if (bookmark.getId() != null) map.put("id", bookmark.getId());
        if (bookmark.getUserId() != null) map.put("user_id", bookmark.getUserId());
        if (bookmark.getDestinationId() != null) map.put("destination_id", bookmark.getDestinationId());
        return map;
    }

    private Long toLong(Object val) {
        if (val == null) return null;
        if (val instanceof Number) return ((Number) val).longValue();
        return Long.parseLong(val.toString());
    }
}
