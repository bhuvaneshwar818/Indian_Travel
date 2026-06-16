package com.indiantravelai.dto;

public class WeatherDto {
    private String city;
    private Double temp;
    private Integer humidity;
    private String icon;
    private String description;
    private String bestTimeToVisit; // e.g. "Oct - Mar"

    public WeatherDto() {}

    public WeatherDto(String city, Double temp, Integer humidity, String icon, String description, String bestTimeToVisit) {
        this.city = city;
        this.temp = temp;
        this.humidity = humidity;
        this.icon = icon;
        this.description = description;
        this.bestTimeToVisit = bestTimeToVisit;
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
}
