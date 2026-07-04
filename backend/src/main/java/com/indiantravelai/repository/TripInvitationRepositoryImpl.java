package com.indiantravelai.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.indiantravelai.config.SupabaseRestClient;
import com.indiantravelai.model.TripInvitation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class TripInvitationRepositoryImpl {

    private static final String TABLE = "trip_invitations";

    @Autowired
    private SupabaseRestClient client;

    private final ObjectMapper snakeCaseMapper = new ObjectMapper()
            .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    public List<TripInvitation> findByInviteeUsernameAndStatus(String inviteeUsername, String status) {
        String filter = SupabaseRestClient.eq("invitee_username", inviteeUsername) + "&status=eq." + status;
        List<Map<String, Object>> results = client.select(TABLE, "*", filter);
        return results.stream()
                .map(this::mapToInvitation)
                .toList();
    }

    public List<TripInvitation> findByTripId(Long tripId) {
        List<Map<String, Object>> results = client.select(TABLE, "*", SupabaseRestClient.eq("trip_id", tripId));
        return results.stream()
                .map(this::mapToInvitation)
                .toList();
    }

    public List<TripInvitation> findByInviterUsername(String username) {
        List<Map<String, Object>> results = client.select(TABLE, "*", SupabaseRestClient.eq("inviter_username", username));
        return results.stream()
                .map(this::mapToInvitation)
                .toList();
    }

    public List<TripInvitation> findByInviteeUsername(String username) {
        List<Map<String, Object>> results = client.select(TABLE, "*", SupabaseRestClient.eq("invitee_username", username));
        return results.stream()
                .map(this::mapToInvitation)
                .toList();
    }

    public Optional<TripInvitation> findById(Long id) {
        List<Map<String, Object>> results = client.select(TABLE, "*", SupabaseRestClient.eq("id", id));
        return results.isEmpty() ? Optional.empty()
                : Optional.of(mapToInvitation(results.get(0)));
    }

    public TripInvitation save(TripInvitation invite) {
        Map<String, Object> data = snakeCaseMapper.convertValue(invite, Map.class);
        if (data.containsKey("created_at") && data.get("created_at") != null) {
            data.put("created_at", data.get("created_at").toString());
        }

        if (invite.getId() == null) {
            data.remove("id");
            Map<String, Object> result = client.insert(TABLE, data);
            return mapToInvitation(result);
        } else {
            client.delete(TABLE, SupabaseRestClient.eq("id", invite.getId()));
            data.remove("id");
            Map<String, Object> result = client.insert(TABLE, data);
            return mapToInvitation(result);
        }
    }

    public void delete(TripInvitation invite) {
        client.delete(TABLE, SupabaseRestClient.eq("id", invite.getId()));
    }

    private TripInvitation mapToInvitation(Map<String, Object> map) {
        if (map == null) return null;
        TripInvitation invite = new TripInvitation();
        invite.setId(toLong(map.get("id")));
        invite.setTripId(toLong(map.get("trip_id")));
        invite.setInviterUsername((String) map.get("inviter_username"));
        invite.setInviteeUsername((String) map.get("invitee_username"));
        invite.setStatus((String) map.get("status"));
        invite.setCreatedAt(parseLocalDateTime(map.get("created_at")));
        return invite;
    }

    private Long toLong(Object val) {
        if (val == null) return null;
        if (val instanceof Number) return ((Number) val).longValue();
        return Long.parseLong(val.toString());
    }

    private LocalDateTime parseLocalDateTime(Object val) {
        if (val == null) return null;
        String str = val.toString();
        try {
            return LocalDateTime.parse(str);
        } catch (Exception e) {
            try {
                return java.time.OffsetDateTime.parse(str).toLocalDateTime();
            } catch (Exception ex) {
                try {
                    return java.time.ZonedDateTime.parse(str).toLocalDateTime();
                } catch (Exception ex2) {
                    String clean = str.replaceAll("([+-]\\d{2}:?\\d{2}|Z)$", "");
                    return LocalDateTime.parse(clean);
                }
            }
        }
    }
}
