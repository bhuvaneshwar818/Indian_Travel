package com.indiantravelai.service;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TransportService {

    public List<Map<String, Object>> getTransportTimings(String from, String to) {
        if (from == null || from.trim().isEmpty()) from = "Mumbai";
        if (to == null || to.trim().isEmpty()) to = "Goa";

        List<Map<String, Object>> list = new ArrayList<>();

        // Add Train Options
        Map<String, Object> train = new HashMap<>();
        train.put("mode", "Train");
        train.put("name", "Express Passenger " + Math.round(100 + Math.random() * 899));
        train.put("departureSlots", List.of("06:30 AM", "02:15 PM", "10:50 PM"));
        train.put("duration", "6h 45m");
        train.put("fare", 480);
        train.put("bookingUrl", "https://www.irctc.co.in");
        list.add(train);

        // Add Luxury Sleeper Bus Option
        Map<String, Object> bus = new HashMap<>();
        bus.put("mode", "Bus");
        bus.put("name", "Royal travels Multi-Axle Sleeper");
        bus.put("departureSlots", List.of("08:00 AM", "06:30 PM", "09:30 PM"));
        bus.put("duration", "8h 15m");
        bus.put("fare", 950);
        bus.put("bookingUrl", "https://www.redbus.in");
        list.add(bus);

        // Add Flight Option if distance is large (e.g. between states/cities)
        boolean longDistance = !from.equalsIgnoreCase(to);
        if (longDistance) {
            Map<String, Object> flight = new HashMap<>();
            flight.put("mode", "Flight");
            flight.put("name", "IndiGo / Air India");
            flight.put("departureSlots", List.of("07:15 AM", "11:45 AM", "07:55 PM"));
            flight.put("duration", "1h 20m");
            flight.put("fare", 4500);
            flight.put("bookingUrl", "https://www.makemytrip.com");
            list.add(flight);
        }

        return list;
    }
}
