package com.indiantravelai.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "destinations")
public class Destination {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String category; // Temples, Beaches, Historical, Food, Adventure

    @Column(length = 2000)
    private String description;

    private double rating;
    private String imageUrl;

    @Column(length = 1000)
    private String famousPlaces; // Comma separated key sights

    @Column(length = 1000)
    private String foodSpots; // Comma separated food suggestions

    private String weatherInfo;

    public Destination() {}

    public Destination(String name, String state, String city, String category, String description, double rating, String imageUrl, String famousPlaces, String foodSpots, String weatherInfo) {
        this.name = name;
        this.state = state;
        this.city = city;
        this.category = category;
        this.description = description;
        this.rating = rating;
        this.imageUrl = imageUrl;
        this.famousPlaces = famousPlaces;
        this.foodSpots = foodSpots;
        this.weatherInfo = weatherInfo;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getFamousPlaces() { return famousPlaces; }
    public void setFamousPlaces(String famousPlaces) { this.famousPlaces = famousPlaces; }

    public String getFoodSpots() { return foodSpots; }
    public void setFoodSpots(String foodSpots) { this.foodSpots = foodSpots; }

    public String getWeatherInfo() { return weatherInfo; }
    public void setWeatherInfo(String weatherInfo) { this.weatherInfo = weatherInfo; }
}
