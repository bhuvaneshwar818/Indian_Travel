package com.indiantravelai.repository;

import com.indiantravelai.config.SupabaseRestClient;

import com.indiantravelai.model.Expense;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@Service
public class ExpenseRepositoryImpl {

    private static final String TABLE = "expenses";

    @Autowired
    private SupabaseRestClient client;

    public List<Expense> findByTripIdOrderByExpenseDateDesc(Long tripId) {
        String filter = SupabaseRestClient.eq("trip_id", tripId) + "&order=expense_date.desc";
        List<Map<String, Object>> results = client.select(TABLE, "*", filter);
        return results.stream().map(this::toEntity).toList();
    }

    public List<Expense> findByTripUserUsernameOrderByExpenseDateDesc(String username) {
        List<Map<String, Object>> users = client.select("users", "id", SupabaseRestClient.eq("username", username));
        if (users.isEmpty()) return List.of();
        Long userId = toLong(users.get(0).get("id"));

        List<Map<String, Object>> trips = client.select("trips", "id", SupabaseRestClient.eq("user_id", userId));
        if (trips.isEmpty()) return List.of();
        String tripIds = trips.stream()
                .map(m -> String.valueOf(toLong(m.get("id"))))
                .collect(Collectors.joining(","));

        String filter = "trip_id=in.(" + tripIds + ")&order=expense_date.desc";
        List<Map<String, Object>> results = client.select(TABLE, "*", filter);
        return results.stream().map(this::toEntity).toList();
    }

    public Optional<Expense> findById(Long id) {
        List<Map<String, Object>> results = client.select(TABLE, "*", SupabaseRestClient.eq("id", id));
        return results.isEmpty() ? Optional.empty()
                : Optional.of(toEntity(results.get(0)));
    }

    public Expense save(Expense expense) {
        Map<String, Object> data = toMap(expense);

        if (expense.getId() == null) {
            Map<String, Object> result = client.insert(TABLE, data);
            return toEntity(result);
        } else {
            client.delete(TABLE, SupabaseRestClient.eq("id", expense.getId()));
            data.remove("id");
            Map<String, Object> result = client.insert(TABLE, data);
            return toEntity(result);
        }
    }

    public void delete(Expense expense) {
        client.delete(TABLE, SupabaseRestClient.eq("id", expense.getId()));
    }

    private Expense toEntity(Map<String, Object> map) {
        Expense e = new Expense();
        e.setId(toLong(map.get("id")));
        e.setTripId(toLong(map.get("trip_id")));
        e.setDescription((String) map.get("description"));
        e.setAmount(toBigDecimal(map.get("amount")));
        e.setCategory((String) map.get("category"));
        e.setPaidBy((String) map.get("paid_by"));
        e.setExpenseDate(map.get("expense_date") != null ? LocalDate.parse(map.get("expense_date").toString()) : null);
        e.setCreatedAt(map.get("created_at") != null ? LocalDateTime.parse(map.get("created_at").toString()) : null);
        return e;
    }

    private Map<String, Object> toMap(Expense expense) {
        Map<String, Object> map = new LinkedHashMap<>();
        if (expense.getId() != null) map.put("id", expense.getId());
        if (expense.getTripId() != null) map.put("trip_id", expense.getTripId());
        map.put("description", expense.getDescription());
        map.put("amount", expense.getAmount());
        map.put("category", expense.getCategory());
        map.put("paid_by", expense.getPaidBy());
        map.put("expense_date", expense.getExpenseDate() != null ? expense.getExpenseDate().toString() : null);
        map.put("created_at", expense.getCreatedAt() != null ? expense.getCreatedAt().toString() : null);
        return map;
    }

    private Long toLong(Object val) {
        if (val == null) return null;
        if (val instanceof Number) return ((Number) val).longValue();
        return Long.parseLong(val.toString());
    }

    private BigDecimal toBigDecimal(Object val) {
        if (val == null) return null;
        if (val instanceof BigDecimal) return (BigDecimal) val;
        if (val instanceof Number) return BigDecimal.valueOf(((Number) val).doubleValue());
        return new BigDecimal(val.toString());
    }
}
