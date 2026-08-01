package com.indiantravelai.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Component
public class SupabaseRestClient {

    private static final Logger log = LoggerFactory.getLogger(SupabaseRestClient.class);
    private final RestTemplate restTemplate;
    private final ObjectMapper mapper;

    @Autowired
    public SupabaseRestClient(ObjectMapper objectMapper) {
        this.mapper = objectMapper;
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(objectMapper);
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        this.restTemplate = new RestTemplate();
        this.restTemplate.getMessageConverters().removeIf(c -> c instanceof MappingJackson2HttpMessageConverter);
        this.restTemplate.getMessageConverters().add(converter);
    }

    @Value("${supabase.url:https://btaerawazalexzuardkp.supabase.co}")
    private String supabaseUrl;

    @Value("${supabase.service.role.key:}")
    private String serviceRoleKey;

    private String baseUrl() {
        return supabaseUrl.replaceAll("/$", "") + "/rest/v1";
    }

    private HttpHeaders headers() {
        HttpHeaders h = new HttpHeaders();
        h.set("apikey", serviceRoleKey);
        h.set("Authorization", "Bearer " + serviceRoleKey);
        h.setContentType(MediaType.APPLICATION_JSON);
        h.setAccept(List.of(MediaType.APPLICATION_JSON));
        return h;
    }

    // ---- SELECT ----
    public List<Map<String, Object>> select(String table) {
        return select(table, "*", null);
    }

    public List<Map<String, Object>> select(String table, String select) {
        return select(table, select, null);
    }

    public List<Map<String, Object>> select(String table, String select, String filter) {
        String url = baseUrl() + "/" + table + "?select=" + select;
        if (filter != null && !filter.isEmpty()) {
            url += "&" + filter;
        }
        log.info("[Supabase] SELECT {} filter={}", table, filter);
        HttpHeaders h = headers();
        HttpEntity<Void> req = new HttpEntity<>(h);
        ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.GET, req, String.class);
        try {
            JsonNode arr = mapper.readTree(resp.getBody());
            List<Map<String, Object>> results = new ArrayList<>();
            if (arr.isArray()) {
                for (JsonNode node : arr) {
                    results.add(mapper.convertValue(node, Map.class));
                }
            }
            return results;
        } catch (Exception e) {
            log.error("[Supabase] Parse error: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public Optional<Map<String, Object>> selectSingle(String table, String filter) {
        List<Map<String, Object>> results = select(table, "*", filter);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    // ---- INSERT ----
    public Map<String, Object> insert(String table, Map<String, Object> data) {
        String url = baseUrl() + "/" + table;
        log.info("[Supabase] INSERT {}", table);
        HttpHeaders h = headers();
        h.set("Prefer", "return=representation");
        HttpEntity<Map<String, Object>> req = new HttpEntity<>(data, h);
        ResponseEntity<String> resp = restTemplate.postForEntity(url, req, String.class);
        try {
            JsonNode node = mapper.readTree(resp.getBody());
            if (node.isArray() && node.size() > 0) {
                return mapper.convertValue(node.get(0), Map.class);
            }
            return mapper.convertValue(node, Map.class);
        } catch (Exception e) {
            log.error("[Supabase] Insert parse error: {}", e.getMessage());
            return data;
        }
    }

    // ---- UPDATE ----
    public List<Map<String, Object>> update(String table, Map<String, Object> data, String filter) {
        String url = baseUrl() + "/" + table + "?" + filter;
        log.info("[Supabase] UPDATE {} filter={}", table, filter);
        HttpHeaders h = headers();
        h.set("Prefer", "return=representation");
        HttpEntity<Map<String, Object>> req = new HttpEntity<>(data, h);
        ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.PATCH, req, String.class);
        try {
            JsonNode arr = mapper.readTree(resp.getBody());
            List<Map<String, Object>> results = new ArrayList<>();
            if (arr.isArray()) {
                for (JsonNode node : arr) {
                    results.add(mapper.convertValue(node, Map.class));
                }
            }
            return results;
        } catch (Exception e) {
            log.error("[Supabase] Update parse error: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    // ---- DELETE ----
    public void delete(String table, String filter) {
        String url = baseUrl() + "/" + table + "?" + filter;
        log.info("[Supabase] DELETE {} filter={}", table, filter);
        HttpHeaders h = headers();
        h.set("Prefer", "return=minimal");
        HttpEntity<Void> req = new HttpEntity<>(h);
        restTemplate.exchange(url, HttpMethod.DELETE, req, String.class);
    }

    // ---- RPC (stored functions) ----
    public Object rpc(String function, Map<String, Object> params) {
        String url = baseUrl() + "/rpc/" + function;
        log.info("[Supabase] RPC {}", function);
        HttpHeaders h = headers();
        h.set("Prefer", "return=representation");
        HttpEntity<Map<String, Object>> req = new HttpEntity<>(params, h);
        ResponseEntity<String> resp = restTemplate.postForEntity(url, req, String.class);
        try {
            return mapper.readTree(resp.getBody());
        } catch (Exception e) {
            return resp.getBody();
        }
    }

    // Utility: build eq filter
    public static String eq(String col, Object val) {
        if (val instanceof String) {
            return col + "=eq." + val;
        }
        return col + "=eq." + val;
    }

    // Utility: build ilike filter
    public static String ilike(String col, String val) {
        return col + "=ilike.*" + val + "*";
    }
}
