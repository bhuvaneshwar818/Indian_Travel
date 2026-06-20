package com.indiantravelai.repository;

import com.indiantravelai.config.SupabaseRestClient;

import com.indiantravelai.model.WishlistPlace;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@Service
public class WishlistRepositoryImpl {

    private static final String TABLE = "wishlist_places";

    @Autowired
    private SupabaseRestClient client;

    public List<WishlistPlace> findByTripIdOrderBySortOrderAsc(Long tripId) {
        String filter = SupabaseRestClient.eq("trip_id", tripId) + "&order=sort_order.asc";
        List<Map<String, Object>> results = client.select(TABLE, "*", filter);
        return results.stream().map(this::toEntity).toList();
    }

    public List<WishlistPlace> findByTripUserUsernameOrderBySortOrderAsc(String username) {
        List<Map<String, Object>> users = client.select("users", "id", SupabaseRestClient.eq("username", username));
        if (users.isEmpty()) return List.of();
        Long userId = toLong(users.get(0).get("id"));

        List<Map<String, Object>> trips = client.select("trips", "id", SupabaseRestClient.eq("user_id", userId));
        if (trips.isEmpty()) return List.of();
        String tripIds = trips.stream()
                .map(m -> String.valueOf(toLong(m.get("id"))))
                .collect(Collectors.joining(","));

        String filter = "trip_id=in.(" + tripIds + ")&order=sort_order.asc";
        List<Map<String, Object>> results = client.select(TABLE, "*", filter);
        return results.stream().map(this::toEntity).toList();
    }

    public Optional<WishlistPlace> findById(Long id) {
        List<Map<String, Object>> results = client.select(TABLE, "*", SupabaseRestClient.eq("id", id));
        return results.isEmpty() ? Optional.empty()
                : Optional.of(toEntity(results.get(0)));
    }

    public List<WishlistPlace> findAllById(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return List.of();
        String idsStr = ids.stream().map(String::valueOf).collect(Collectors.joining(","));
        String filter = "id=in.(" + idsStr + ")";
        List<Map<String, Object>> results = client.select(TABLE, "*", filter);
        return results.stream().map(this::toEntity).toList();
    }

    public WishlistPlace save(WishlistPlace place) {
        Map<String, Object> data = toMap(place);

        if (place.getId() == null) {
            Map<String, Object> result = client.insert(TABLE, data);
            return toEntity(result);
        } else {
            client.delete(TABLE, SupabaseRestClient.eq("id", place.getId()));
            data.remove("id");
            Map<String, Object> result = client.insert(TABLE, data);
            return toEntity(result);
        }
    }

    public void delete(WishlistPlace place) {
        client.delete(TABLE, SupabaseRestClient.eq("id", place.getId()));
    }

    private WishlistPlace toEntity(Map<String, Object> map) {
        WishlistPlace w = new WishlistPlace();
        w.setId(toLong(map.get("id")));
        w.setTripId(toLong(map.get("trip_id")));
        w.setPlaceName((String) map.get("place_name"));
        w.setState((String) map.get("state"));
        w.setCategory((String) map.get("category"));
        w.setLat(toDouble(map.get("lat")));
        w.setLng(toDouble(map.get("lng")));
        w.setSortOrder(toInteger(map.get("sort_order")));
        w.setAddedAt(parseLocalDateTime(map.get("added_at")));
        return w;
    }

    private Map<String, Object> toMap(WishlistPlace place) {
        Map<String, Object> map = new LinkedHashMap<>();
        if (place.getId() != null) map.put("id", place.getId());
        if (place.getTripId() != null) map.put("trip_id", place.getTripId());
        map.put("place_name", place.getPlaceName());
        map.put("state", place.getState());
        map.put("category", place.getCategory());
        map.put("lat", place.getLat());
        map.put("lng", place.getLng());
        map.put("sort_order", place.getSortOrder());
        map.put("added_at", place.getAddedAt() != null ? place.getAddedAt().toString() : null);
        return map;
    }

    private Long toLong(Object val) {
        if (val == null) return null;
        if (val instanceof Number) return ((Number) val).longValue();
        return Long.parseLong(val.toString());
    }

    private Double toDouble(Object val) {
        if (val == null) return null;
        if (val instanceof Number) return ((Number) val).doubleValue();
        return Double.parseDouble(val.toString());
    }

    private Integer toInteger(Object val) {
        if (val == null) return null;
        if (val instanceof Number) return ((Number) val).intValue();
        return Integer.parseInt(val.toString());
    }

    private LocalDateTime parseLocalDateTime(Object val) {
        if (val == null) return null;
        return LocalDateTime.parse(val.toString());
    }
}
