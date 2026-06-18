package com.indiantravelai.dto;

import java.util.ArrayList;
import java.util.List;

public class WeatherDto {
    private String city;
    private Double temp;
    private Integer humidity;
    private String icon;
    private String description;
    private String bestTimeToVisit; // e.g. "Oct - Mar"
    private List<ForecastDayDto> pastForecast = new ArrayList<>();
    private List<ForecastDayDto> futureForecast = new ArrayList<>();

    public static class ForecastDayDto {
        private String date; // e.g. "Thu, Jun 18"
        private Double temp;
        private Integer humidity;
        private String icon;
        private String description;

        public ForecastDayDto() {}

        public ForecastDayDto(String date, Double temp, Integer humidity, String icon, String description) {
            this.date = date;
            this.temp = temp;
            this.humidity = humidity;
            this.icon = icon;
            this.description = description;
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public Double getTemp() { return temp; }
        public void setTemp(Double temp) { this.temp = temp; }

        public Integer getHumidity() { return humidity; }
        public void setHumidity(Integer humidity) { this.humidity = humidity; }

        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public WeatherDto() {}

    public WeatherDto(String city, Double temp, Integer humidity, String icon, String description, String bestTimeToVisit) {
        this.city = city;
        this.temp = temp;
        this.humidity = humidity;
        this.icon = icon;
        this.description = description;
        this.bestTimeToVisit = bestTimeToVisit;
    }

    public WeatherDto(String city, Double temp, Integer humidity, String icon, String description, String bestTimeToVisit,
                      List<ForecastDayDto> pastForecast, List<ForecastDayDto> futureForecast) {
        this.city = city;
        this.temp = temp;
        this.humidity = humidity;
        this.icon = icon;
        this.description = description;
        this.bestTimeToVisit = bestTimeToVisit;
        this.pastForecast = pastForecast;
        this.futureForecast = futureForecast;
    }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public Double getTemp() { return temp; }
    public void setTemp(Double temp) { this.temp = temp; }

    public Integer getHumidity() { return humidity; }
    public void setHumidity(Integer humidity) { this.humidity = humidity; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBestTimeToVisit() { return bestTimeToVisit; }
    public void setBestTimeToVisit(String bestTimeToVisit) { this.bestTimeToVisit = bestTimeToVisit; }

    public List<ForecastDayDto> getPastForecast() { return pastForecast; }
    public void setPastForecast(List<ForecastDayDto> pastForecast) { this.pastForecast = pastForecast; }

    public List<ForecastDayDto> getFutureForecast() { return futureForecast; }
    public void setFutureForecast(List<ForecastDayDto> futureForecast) { this.futureForecast = futureForecast; }
}
