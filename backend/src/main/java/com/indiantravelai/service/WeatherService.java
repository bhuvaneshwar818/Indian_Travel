package com.indiantravelai.service;

import com.indiantravelai.dto.WeatherDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
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

    public WeatherDto getWeather(String city, Double lat, Double lng) {
        if (city == null || city.trim().isEmpty()) {
            if (lat == null || lng == null) {
                city = "Goa";
            }
        }
        
        String cacheKey;
        if (city != null && !city.trim().isEmpty()) {
            cacheKey = city.trim().toLowerCase();
        } else {
            cacheKey = String.format("%.3f,%.3f", lat, lng);
        }
        
        // Cache Lookup
        CacheEntry cached = weatherCache.get(cacheKey);
        if (cached != null && cached.expiry.isAfter(LocalDateTime.now())) {
            return cached.data;
        }

        WeatherDto result;
        // Make API Call if Key is present
        if (apiKey != null && !apiKey.trim().isEmpty() && !apiKey.equals("your_key_here")) {
            try {
                // 1. Fetch current weather
                String currentUrl;
                if (lat != null && lng != null) {
                    currentUrl = String.format("https://api.openweathermap.org/data/2.5/weather?lat=%f&lon=%f&appid=%s&units=metric", lat, lng, apiKey);
                } else {
                    currentUrl = String.format("https://api.openweathermap.org/data/2.5/weather?q=%s,IN&appid=%s&units=metric", city, apiKey);
                }
                Map<?, ?> currentResponse = restTemplate.getForObject(currentUrl, Map.class);
                
                if (currentResponse != null && currentResponse.containsKey("main")) {
                    Map<?, ?> main = (Map<?, ?>) currentResponse.get("main");
                    List<?> weatherList = (List<?>) currentResponse.get("weather");
                    Map<?, ?> weather = (weatherList != null && !weatherList.isEmpty()) ? (Map<?, ?>) weatherList.get(0) : null;

                    Double temp = main.get("temp") instanceof Number ? ((Number) main.get("temp")).doubleValue() : 28.0;
                    Integer humidity = main.get("humidity") instanceof Number ? ((Number) main.get("humidity")).intValue() : 70;
                    String icon = weather != null ? (String) weather.get("icon") : "01d";
                    String desc = weather != null ? (String) weather.get("description") : "Clear sky";
                    
                    String resolvedCity = currentResponse.containsKey("name") && currentResponse.get("name") != null && !((String) currentResponse.get("name")).isEmpty() 
                                          ? (String) currentResponse.get("name") : city;
                    if (resolvedCity == null) {
                        resolvedCity = String.format("Coords: %.2f, %.2f", lat, lng);
                    }

                    // 2. Fetch forecast
                    List<WeatherDto.ForecastDayDto> futureList = new ArrayList<>();
                    try {
                        String forecastUrl;
                        if (lat != null && lng != null) {
                            forecastUrl = String.format("https://api.openweathermap.org/data/2.5/forecast?lat=%f&lon=%f&appid=%s&units=metric", lat, lng, apiKey);
                        } else {
                            forecastUrl = String.format("https://api.openweathermap.org/data/2.5/forecast?q=%s,IN&appid=%s&units=metric", city, apiKey);
                        }
                        Map<?, ?> forecastResponse = restTemplate.getForObject(forecastUrl, Map.class);
                        
                        if (forecastResponse != null && forecastResponse.containsKey("list")) {
                            List<?> list = (List<?>) forecastResponse.get("list");
                            java.util.Map<java.time.LocalDate, WeatherDto.ForecastDayDto> dailyForecasts = new java.util.LinkedHashMap<>();
                            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("E, MMM dd");
                            
                            for (Object itemObj : list) {
                                Map<?, ?> item = (Map<?, ?>) itemObj;
                                String dtTxt = (String) item.get("dt_txt");
                                if (dtTxt == null || dtTxt.length() < 10) continue;
                                
                                String dateStr = dtTxt.substring(0, 10);
                                java.time.LocalDate date = java.time.LocalDate.parse(dateStr);
                                
                                boolean isNoon = dtTxt.contains("12:00:00");
                                if (!dailyForecasts.containsKey(date) || isNoon) {
                                    Map<?, ?> fMain = (Map<?, ?>) item.get("main");
                                    List<?> fWeatherList = (List<?>) item.get("weather");
                                    Map<?, ?> fWeather = (fWeatherList != null && !fWeatherList.isEmpty()) ? (Map<?, ?>) fWeatherList.get(0) : null;
                                    
                                    Double fTemp = fMain != null && fMain.get("temp") != null ? ((Number) fMain.get("temp")).doubleValue() : temp;
                                    Integer fHumidity = fMain != null && fMain.get("humidity") != null ? ((Number) fMain.get("humidity")).intValue() : humidity;
                                    String fIcon = fWeather != null ? (String) fWeather.get("icon") : icon;
                                    String fDesc = fWeather != null ? (String) fWeather.get("description") : desc;
                                    
                                    dailyForecasts.put(date, new WeatherDto.ForecastDayDto(date.format(formatter), fTemp, fHumidity, fIcon, fDesc));
                                }
                            }
                            futureList.addAll(dailyForecasts.values());
                        }
                    } catch (Exception fe) {
                        System.err.println("Failed to fetch forecast list for " + resolvedCity + ": " + fe.getMessage());
                    }

                    // Extrapolate future up to 7 days if needed
                    java.time.LocalDate today = java.time.LocalDate.now();
                    java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("E, MMM dd");
                    
                    double lastTemp = temp;
                    int lastHumidity = humidity;
                    String lastIcon = icon;
                    String lastDesc = desc;
                    
                    if (!futureList.isEmpty()) {
                        WeatherDto.ForecastDayDto lastDay = futureList.get(futureList.size() - 1);
                        lastTemp = lastDay.getTemp();
                        lastHumidity = lastDay.getHumidity();
                        lastIcon = lastDay.getIcon();
                        lastDesc = lastDay.getDescription();
                    }

                    while (futureList.size() < 7) {
                        int index = futureList.size();
                        LocalDate d = today.plusDays(index);
                        double varTemp = lastTemp + (index % 2 == 0 ? 0.4 : -0.6);
                        int varHum = Math.max(0, Math.min(100, lastHumidity + (index % 2 == 0 ? 3 : -2)));
                        futureList.add(new WeatherDto.ForecastDayDto(d.format(formatter), varTemp, varHum, lastIcon, lastDesc));
                    }
                    if (futureList.size() > 7) {
                        futureList = futureList.subList(0, 7);
                    }

                    // 3. Generate past 2 days forecast
                    List<WeatherDto.ForecastDayDto> pastList = new ArrayList<>();
                    pastList.add(new WeatherDto.ForecastDayDto(today.minusDays(2).format(formatter), temp - 1.4, Math.min(100, humidity + 6), icon, desc));
                    pastList.add(new WeatherDto.ForecastDayDto(today.minusDays(1).format(formatter), temp + 0.3, Math.max(0, humidity - 2), icon, desc));

                    result = new WeatherDto(
                            resolvedCity,
                            temp,
                            humidity,
                            icon,
                            desc,
                            getBestTimeToVisit(resolvedCity),
                            pastList,
                            futureList
                    );
                } else {
                    result = generateMockWeather(city != null ? city : "Unknown");
                }
            } catch (Exception e) {
                System.err.println("OpenWeatherMap API call failed. Using mock fallback: " + e.getMessage());
                result = generateMockWeather(city != null ? city : "Unknown");
            }
        } else {
            result = generateMockWeather(city != null ? city : "Unknown");
        }

        // Cache for 30 minutes
        weatherCache.put(cacheKey, new CacheEntry(result, LocalDateTime.now().plusMinutes(30)));
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

        // Generate past & future lists for mock
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.format.DateTimeFormatter dateDisplayFormatter = java.time.format.DateTimeFormatter.ofPattern("E, MMM dd");

        java.util.List<WeatherDto.ForecastDayDto> pastList = new java.util.ArrayList<>();
        pastList.add(new WeatherDto.ForecastDayDto(today.minusDays(2).format(dateDisplayFormatter), temp - 1.5, Math.min(100, humidity + 4), icon, desc));
        pastList.add(new WeatherDto.ForecastDayDto(today.minusDays(1).format(dateDisplayFormatter), temp + 0.5, Math.max(0, humidity - 2), icon, desc));

        java.util.List<WeatherDto.ForecastDayDto> futureList = new java.util.ArrayList<>();
        for (int i = 0; i < 7; i++) {
            double varTemp = temp + (i % 2 == 0 ? 0.4 * i : -0.3 * i);
            int varHum = Math.max(0, Math.min(100, humidity + (i % 2 == 0 ? 2 * i : -1 * i)));
            futureList.add(new WeatherDto.ForecastDayDto(today.plusDays(i).format(dateDisplayFormatter), varTemp, varHum, icon, desc));
        }

        return new WeatherDto(city, temp, humidity, icon, desc, bestTime, pastList, futureList);
    }

    private String getBestTimeToVisit(String city) {
        String lower = city.toLowerCase();
        if (lower.contains("leh") || lower.contains("ladakh")) return "May - Sep";
        if (lower.contains("jaipur") || lower.contains("rajasthan")) return "Oct - Mar";
        if (lower.contains("ooty") || lower.contains("munnar")) return "Sep - May";
        return "Oct - Mar"; // default for most places in India
    }
}
