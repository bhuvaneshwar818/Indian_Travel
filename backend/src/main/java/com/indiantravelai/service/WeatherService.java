package com.indiantravelai.service;

import com.indiantravelai.dto.WeatherDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WeatherService {

    @Value("${openweather.api.key:}")
    private String apiKey;

    private static class CacheEntry {
        WeatherDto data;
        LocalDateTime expiry;

        CacheEntry(WeatherDto data, LocalDateTime expiry) {
            this.data = data;
            this.expiry = expiry;
        }
    }

    private final Map<String, CacheEntry> weatherCache = new ConcurrentHashMap<>();
    private final RestTemplate restTemplate = new RestTemplate();

    public WeatherDto getWeather(String city) {
        if (city == null || city.trim().isEmpty()) {
            city = "Goa";
        }
        String cleanCity = city.trim().toLowerCase();
        
        // Cache Lookup
        CacheEntry cached = weatherCache.get(cleanCity);
        if (cached != null && cached.expiry.isAfter(LocalDateTime.now())) {
            return cached.data;
        }

        WeatherDto result;
        // Make API Call if Key is present
        if (apiKey != null && !apiKey.trim().isEmpty() && !apiKey.equals("your_key_here")) {
            try {
                String url = String.format("https://api.openweathermap.org/data/2.5/weather?q=%s,IN&appid=%s&units=metric", city, apiKey);
                Map<?, ?> response = restTemplate.getForObject(url, Map.class);
                
                if (response != null && response.containsKey("main")) {
                    Map<?, ?> main = (Map<?, ?>) response.get("main");
                    Map<?, ?> wind = (Map<?, ?>) response.get("wind");
                    Object[] weatherArr = (Object[]) response.get("weather");
                    Map<?, ?> weather = weatherArr.length > 0 ? (Map<?, ?>) weatherArr[0] : null;

                    Double temp = main.get("temp") instanceof Number ? ((Number) main.get("temp")).doubleValue() : 28.0;
                    Integer humidity = main.get("humidity") instanceof Number ? ((Number) main.get("humidity")).intValue() : 70;
                    String icon = weather != null ? (String) weather.get("icon") : "01d";
                    String desc = weather != null ? (String) weather.get("description") : "Clear sky";

                    result = new WeatherDto(
                            city,
                            temp,
                            humidity,
                            icon,
                            desc,
                            getBestTimeToVisit(city)
                    );
                } else {
                    result = generateMockWeather(city);
                }
            } catch (Exception e) {
                System.err.println("OpenWeatherMap API call failed. Using mock fallback: " + e.getMessage());
                result = generateMockWeather(city);
            }
        } else {
            result = generateMockWeather(city);
        }

        // Cache for 30 minutes
        weatherCache.put(cleanCity, new CacheEntry(result, LocalDateTime.now().plusMinutes(30)));
        return result;
    }

    private WeatherDto generateMockWeather(String city) {
        String lowerCity = city.toLowerCase();
        double temp = 28.5;
        int humidity = 65;
        String icon = "02d"; // few clouds
        String desc = "Mild tropical breeze";
        String bestTime = "Nov - Feb";

        if (lowerCity.contains("leh") || lowerCity.contains("ladakh")) {
            temp = 14.0;
            humidity = 35;
            icon = "01d"; // clear sky
            desc = "Crisp, cold mountain air";
            bestTime = "May - Sep";
        } else if (lowerCity.contains("jaipur") || lowerCity.contains("rajasthan") || lowerCity.contains("jodhpur")) {
            temp = 34.0;
            humidity = 25;
            icon = "01d";
            desc = "Sunny and hot";
            bestTime = "Oct - Mar";
        } else if (lowerCity.contains("ooty") || lowerCity.contains("munnar") || lowerCity.contains("hill")) {
            temp = 18.0;
            humidity = 80;
            icon = "03d"; // scattered clouds
            desc = "Chilly mist and fog";
            bestTime = "Sep - May";
        } else if (lowerCity.contains("kerala") || lowerCity.contains("alleppey") || lowerCity.contains("kochi")) {
            temp = 29.0;
            humidity = 85;
            icon = "04d"; // broken clouds
            desc = "Humid, warm coastal weather";
            bestTime = "Oct - Mar";
        } else if (lowerCity.contains("varanasi")) {
            temp = 30.0;
            humidity = 55;
            icon = "02d";
            desc = "Pleasant haze over the ghats";
            bestTime = "Nov - Mar";
        }

        return new WeatherDto(city, temp, humidity, icon, desc, bestTime);
    }

    private String getBestTimeToVisit(String city) {
        String lower = city.toLowerCase();
        if (lower.contains("leh") || lower.contains("ladakh")) return "May - Sep";
        if (lower.contains("jaipur") || lower.contains("rajasthan")) return "Oct - Mar";
        if (lower.contains("ooty") || lower.contains("munnar")) return "Sep - May";
        return "Oct - Mar"; // default for most places in India
    }
}
