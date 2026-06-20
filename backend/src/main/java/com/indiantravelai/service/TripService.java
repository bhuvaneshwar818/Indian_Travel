package com.indiantravelai.service;

import com.indiantravelai.dto.TripPlanRequest;
import com.indiantravelai.entity.Trip;
import com.indiantravelai.entity.User;
import com.indiantravelai.repository.TripRepositoryImpl;
import com.indiantravelai.repository.UserRepositoryImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TripService {

    @Autowired
    private TripRepositoryImpl tripRepository;

    @Autowired
    private UserRepositoryImpl userRepository;

    public List<Trip> getTripsByUsername(String username) {
        return tripRepository.findByUserUsernameOrderByCreatedAtDesc(username);
    }

    public Trip getOrCreateActiveTrip(String username) {
        List<Trip> trips = tripRepository.findByUserUsernameOrderByCreatedAtDesc(username);
        if (!trips.isEmpty()) {
            return trips.get(0);
        }
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        Trip placeholder = new Trip();
        placeholder.setUserId(user.getId());
        placeholder.setTitle("My Active Plan");
        placeholder.setState("Goa");
        placeholder.setCategory("Beaches");
        placeholder.setBudget("Moderate");
        placeholder.setDuration(3);
        placeholder.setTotalBudgetEstimate(5000.0);
        placeholder.setTravelMode("SOLO");
        placeholder.setTransportMode("PUBLIC");
        placeholder.setStartLocation("Mumbai");
        
        return tripRepository.save(placeholder);
    }

    public Trip saveTrip(String username, TripPlanRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        String title = "AI " + request.getCategory() + " Trip to " + request.getState();
        double totalBudget = calculateBudget(request.getBudget(), request.getDuration());
        String itineraryJson = generateItineraryJson(request.getState(), request.getCategory(), request.getBudget(), request.getDuration());

        Trip trip = new Trip(user.getId(), title, request.getState(), request.getCategory(), request.getBudget(), request.getDuration(), itineraryJson, totalBudget);
        return tripRepository.save(trip);
    }

    public void deleteTrip(Long tripId, String username) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found!"));

        User user = userRepository.findById(trip.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found for trip!"));

        if (!user.getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to delete this trip!");
        }

        tripRepository.delete(trip);
    }

    private double calculateBudget(String budgetLevel, int duration) {
        double ratePerDay = 2500.0;
        if ("Moderate".equalsIgnoreCase(budgetLevel)) {
            ratePerDay = 6000.0;
        } else if ("Luxury".equalsIgnoreCase(budgetLevel)) {
            ratePerDay = 15000.0;
        }
        return ratePerDay * duration;
    }

    private String generateItineraryJson(String state, String category, String budgetLevel, int duration) {
        String weatherStr;
        String hotelList;
        String packingList;
        String travelTips;
        StringBuilder itineraryBuilder = new StringBuilder();

        if ("Goa".equalsIgnoreCase(state)) {
            weatherStr = "Tropical and warm (26°C - 33°C). Ideal for coastal excursions.";
            hotelList = "[{\"name\": \"Whispering Palms Beach Clay resort\", \"price\": \"₹4,500/night\", \"rating\": 4.7}," +
                        "{\"name\": \"Taj Exotica Resort & Spa\", \"price\": \"₹18,000/night\", \"rating\": 4.9}]";
            packingList = "[\"Sunscreen lotion\", \"Light cotton outfits\", \"Comfortable flip-flops\", \"Sunglasses\", \"Swimwear\"]";
            travelTips = "\"Solo Tip: Rent a scooty for ₹300/day. Group Tip: Book a private catamaran cruise in south Goa.\"";
        } else if ("Kerala".equalsIgnoreCase(state)) {
            weatherStr = "Pleasant and humid (24°C - 30°C). Perfect for houseboat sailing.";
            hotelList = "[{\"name\": \"Kumarakom Lake Resort\", \"price\": \"₹12,000/night\", \"rating\": 4.8}," +
                        "{\"name\": \"Munnar Claymorphic Treehouses\", \"price\": \"₹3,500/night\", \"rating\": 4.5}]";
            packingList = "[\"Umbrella (frequent showers)\", \"Mosquito repellent\", \"Trekking shoes\", \"Camera\", \"Breathable cottons\"]";
            travelTips = "\"Solo Tip: Travel via local state buses for scenic routes. Group Tip: Stay overnight on a backwater houseboat.\"";
        } else if ("Rajasthan".equalsIgnoreCase(state) || "Jaipur".equalsIgnoreCase(state)) {
            weatherStr = "Sunny and dry (20°C - 32°C). Evenings are cool and breezy.";
            hotelList = "[{\"name\": \"Umaid Bhawan Palace\", \"price\": \"₹35,000/night\", \"rating\": 5.0}," +
                        "{\"name\": \"Chokhi Dhani Ethnic Resort\", \"price\": \"₹5,500/night\", \"rating\": 4.6}]";
            packingList = "[\"Wide-brimmed sun hat\", \"Scarf to protect from dust\", \"Sunglasses\", \"Modest clothing for heritage sites\"]";
            travelTips = "\"Solo Tip: Get a composite entry ticket to visit all major forts in Jaipur. Group Tip: Opt for an evening desert safari.\"";
        } else if ("Ladakh".equalsIgnoreCase(state)) {
            weatherStr = "Cold and crisp (5°C - 18°C). High altitude air, clear blue skies.";
            hotelList = "[{\"name\": \"The Grand Dragon Ladakh\", \"price\": \"₹8,500/night\", \"rating\": 4.8}," +
                        "{\"name\": \"Ladakh Clay Homestay\", \"price\": \"₹2,000/night\", \"rating\": 4.6}]";
            packingList = "[\"Thermal innerwear\", \"Down jacket\", \"High SPF Sunscreen\", \"Lip balm\", \"Hydration salts\"]";
            travelTips = "\"Solo Tip: Spend your first 24 hours strictly resting to acclimatize. Group Tip: Rent a 4x4 SUV to navigate mountain passes.\"";
        } else if ("Varanasi".equalsIgnoreCase(state) || "Uttar Pradesh".equalsIgnoreCase(state)) {
            weatherStr = "Warm (22°C - 34°C). Spiritual mornings are misty and gorgeous.";
            hotelList = "[{\"name\": \"Brijrama Palace Heritage Hotel\", \"price\": \"₹14,000/night\", \"rating\": 4.9}," +
                        "{\"name\": \"Ganges Claymorphic Inn\", \"price\": \"₹2,200/night\", \"rating\": 4.4}]";
            packingList = "[\"Slip-on shoes for temple tours\", \"Modest clothing\", \"Hand sanitizer\", \"Camera for Ganga Aarti\"]";
            travelTips = "\"Solo Tip: Attend the early morning Subah-e-Banaras at Assi Ghat. Group Tip: Hire a private rowboat for sunset Aarti.\"";
        } else {
            weatherStr = "Moderate and delightful (22°C - 30°C). Perfect for multi-category tourism.";
            hotelList = "[{\"name\": \"Royal Heritage Claymorphic Plaza\", \"price\": \"₹3,800/night\", \"rating\": 4.6}," +
                        "{\"name\": \"Standard Holiday Lodge\", \"price\": \"₹2,100/night\", \"rating\": 4.3}]";
            packingList = "[\"Comfortable walking shoes\", \"Power bank\", \"Universal adapter\", \"Light jacket\", \"Personal medications\"]";
            travelTips = "\"Solo Tip: Always use registered e-rickshaws for transit. Group Tip: Try local street food platters to sample varieties.\"";
        }

        itineraryBuilder.append("[");
        for (int i = 1; i <= duration; i++) {
            itineraryBuilder.append("{");
            itineraryBuilder.append("\"dayNumber\": ").append(i).append(",");
            itineraryBuilder.append("\"theme\": \"").append(getDayTheme(category, i)).append("\",");
            itineraryBuilder.append("\"morning\": \"").append(getDayMorning(state, category, i)).append("\",");
            itineraryBuilder.append("\"afternoon\": \"").append(getDayAfternoon(state, category, i)).append("\",");
            itineraryBuilder.append("\"evening\": \"").append(getDayEvening(state, category, i)).append("\",");
            itineraryBuilder.append("\"meals\": \"").append(getDayMeals(state, category, i)).append("\"");
            itineraryBuilder.append("}");
            if (i < duration) {
                itineraryBuilder.append(",");
            }
        }
        itineraryBuilder.append("]");

        return "{" +
                "\"state\": \"" + state + "\"," +
                "\"category\": \"" + category + "\"," +
                "\"budget\": \"" + budgetLevel + "\"," +
                "\"duration\": " + duration + "," +
                "\"weather\": \"" + weatherStr + "\"," +
                "\"hotels\": " + hotelList + "," +
                "\"itinerary\": " + itineraryBuilder.toString() + "," +
                "\"packing\": " + packingList + "," +
                "\"tips\": " + travelTips +
                "}";
    }

    private String getDayTheme(String category, int day) {
        String[] themes = {
            "Arrival and First Insights",
            "Deep Cultural & Sensory Immersion",
            "Hidden Treasures & Adventure Quests",
            "Scenic Scenic Vistas & Sunset Vibe",
            "Culinary Trails & Local Handicrafts",
            "Nature Retreat & Rejuvenation",
            "Heritage Preservation Walk",
            "Outdoor Expeditions & Local Markets",
            "Panoramic Outlooks & Photography Trail",
            "Farewell & Souvenir Gathering"
        };
        return themes[(day - 1) % themes.length] + " (" + category + ")";
    }

    private String getDayMorning(String state, String category, int day) {
        if ("Beaches".equalsIgnoreCase(category)) {
            return "Rise early to catch a breathtaking sunrise. Engage in a rejuvenating beachside yoga session or take a serene morning swim.";
        } else if ("Temples".equalsIgnoreCase(category)) {
            return "Head out at dawn to participate in the majestic morning chants and sacred rituals. The early morning mist offers unmatched peacefulness.";
        } else if ("Adventure".equalsIgnoreCase(category)) {
            return "Start early for your outdoor trek. Secure your safety gear and receive the briefing from certified AI guides before climbing.";
        } else if ("Food".equalsIgnoreCase(category)) {
            return "Embark on a traditional breakfast crawl through historic alleys, sampling freshly steamed regional delights and hot spiced tea.";
        }
        return "Begin your morning with an expert-guided orientation walk, taking in the unique architectural features and heritage markers of " + state + ".";
    }

    private String getDayAfternoon(String state, String category, int day) {
        if ("Beaches".equalsIgnoreCase(category)) {
            return "Take up exciting watersports like jet-skiing or parasailing. Later, relax under a palm-shaded shack sipping cool coconut water.";
        } else if ("Temples".equalsIgnoreCase(category)) {
            return "Visit the adjacent temple museum and explore ancient rock carvings and detailed historical exhibits from centuries past.";
        } else if ("Adventure".equalsIgnoreCase(category)) {
            return "Negotiate rough terrains or paddle down crystal clear rivers. Stop at a scenic overlook for a rustic picnic lunch.";
        } else if ("Food".equalsIgnoreCase(category)) {
            return "Participate in an interactive culinary masterclass led by local chefs. Learn the exact spices and secrets of native gravies.";
        }
        return "Explore the main museum, art exhibits, or fort premises. Sample local artisan crafts and watch master weavers create beautiful patterns.";
    }

    private String getDayEvening(String state, String category, int day) {
        if ("Beaches".equalsIgnoreCase(category)) {
            return "Unwind with a peaceful beach walk at sunset. Later, dine at a glowing, claymorphic seafood restaurant with soothing acoustic music.";
        } else if ("Temples".equalsIgnoreCase(category)) {
            return "Attend the grand evening Aarti, where hundreds of oil lamps light up the ghats or sanctum in a breathtaking spiritual spectacle.";
        } else if ("Adventure".equalsIgnoreCase(category)) {
            return "Set up your overnight camp or check in to a rustic wooden cabin. Gather around a cozy campfire and swap travel tales under the stars.";
        } else if ("Food".equalsIgnoreCase(category)) {
            return "Indulge in a premium, multi-course culinary dinner showcasing royal spices, concluding with iconic sweet delicacies of " + state + ".";
        }
        return "Witness a traditional dance or musical performance by regional artists. Walk through lively night bazaars and shop for handcrafted souvenirs.";
    }

    private String getDayMeals(String state, String category, int day) {
        if ("Goa".equalsIgnoreCase(state)) {
            return "Prawn Balchao, Goan Poi bread, Bebinca dessert, Kokum Soda";
        } else if ("Kerala".equalsIgnoreCase(state)) {
            return "Sadya feast on a banana leaf, Karimeen Pollichathu, Idiyappam with curry";
        } else if ("Rajasthan".equalsIgnoreCase(state)) {
            return "Dal Baati Churma, Ker Sangri, Laal Maas, Mawa Kachori";
        } else if ("Varanasi".equalsIgnoreCase(state)) {
            return "Kachori Sabzi, Tamatar Chaat, Banarasi Lassi, Rabri";
        } else if ("Ladakh".equalsIgnoreCase(state)) {
            return "Hot Thukpa soup, Steamed mutton momos, Butter Tea, Apricot jam";
        }
        return "Spiced Samosa, regional thali platter, hot Gulab Jamun, Cardamom Chai";
    }
}
