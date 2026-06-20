package com.indiantravelai.config;

import com.indiantravelai.entity.Destination;
import com.indiantravelai.entity.Review;
import com.indiantravelai.entity.User;
import com.indiantravelai.repository.DestinationRepositoryImpl;
import com.indiantravelai.repository.ReviewRepositoryImpl;
import com.indiantravelai.repository.UserRepositoryImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepositoryImpl userRepository;

    @Autowired
    private DestinationRepositoryImpl destinationRepository;

    @Autowired
    private ReviewRepositoryImpl reviewRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedDestinations();
        seedReviews();
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            // Seed a test user: testuser / password123
            User user = new User();
            user.setUsername("testuser");
            user.setEmail("testuser@indiantravelai.com");
            user.setPassword(passwordEncoder.encode("password123"));
            user.setFullName("Aravind Sharma");
            user.setRole("ROLE_USER");
            user.setEnabled(true); // Pre-verified for direct testing
            userRepository.save(user);

            // Seed an admin user: admin / admin123
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@indiantravelai.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("System Admin");
            admin.setRole("ROLE_ADMIN");
            admin.setEnabled(true);
            userRepository.save(admin);

            System.out.println(">>> User accounts seeded successfully: 'testuser' & 'admin'");
        }
    }

    private void seedDestinations() {
        if (destinationRepository.count() == 0) {
            destinationRepository.save(new Destination(
                    "Goa Beaches", "Goa", "Panaji", "Beaches",
                    "Famous for its sun-kissed beaches, vibrant nightlife, 17th-century Portuguese churches, and rich spice plantations.",
                    4.8, "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
                    "Calangute Beach, Baga Beach, Fort Aguada, Dudhsagar Waterfalls",
                    "Prawn Balchao, Fish Curry Rice, Bebinca, Feni cocktail",
                    "Sunny and warm. Tropical breezes blow constantly. (26°C - 33°C)"
            ));

            destinationRepository.save(new Destination(
                    "Alleppey Backwaters", "Kerala", "Alappuzha", "Beaches",
                    "Known for its houseboat cruises along rustic Kerala canals, coconut groves, and tranquil lagoons.",
                    4.9, "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800",
                    "Vembanad Lake, Alappuzha Beach, Pathiramanal Island, Krishnapuram Palace",
                    "Karimeen Pollichathu, Kerala Sadya on banana leaf, Toddy drink",
                    "Tropical and humid. Splendid backwater breeze. (24°C - 31°C)"
            ));

            destinationRepository.save(new Destination(
                    "Jaipur Heritage", "Rajasthan", "Jaipur", "Historical",
                    "The famous 'Pink City' showcases spectacular palace complexes, grand hilltop fortresses, and colorful traditional bazaars.",
                    4.8, "https://images.unsplash.com/photo-1477584322811-591f423758b7?w=800",
                    "Amber Fort, Hawa Mahal, City Palace, Jantar Mantar Observatory",
                    "Dal Baati Churma, Pyaaz Kachori, Gatte ki Sabzi, Ghevar sweet",
                    "Sunny, dry and desert-like. Cool atmospheric evenings. (20°C - 32°C)"
            ));

            destinationRepository.save(new Destination(
                    "Varanasi Ghats", "Uttar Pradesh", "Varanasi", "Temples",
                    "One of the oldest continuously inhabited cities in the world, Varanasi is the spiritual core of India on the banks of the sacred Ganges.",
                    4.9, "https://images.unsplash.com/photo-1561361513-2d000a50f0db?w=800",
                    "Kashi Vishwanath Temple, Dashashwamedh Ghat Aarti, Sarnath Buddhist Stupa",
                    "Kachori Sabzi, Banarasi Tamatar Chaat, Special Banarasi Lassi, Rabri",
                    "Spiritual and warm. Misty, pleasant early mornings. (18°C - 33°C)"
            ));

            destinationRepository.save(new Destination(
                    "Leh Ladakh Pass", "Ladakh", "Leh", "Adventure",
                    "A high-altitude alpine desert region defined by majestic snow-clad passes, turquoise lakes, and historic Tibetan monasteries.",
                    4.9, "https://images.unsplash.com/photo-1581793745862-99f57567af25?w=800",
                    "Pangong Tso Lake, Nubra Valley, Khardung La Pass, Thiksey Monastery",
                    "Thukpa soup, Steamed Momos, Butter Tea, Skyu wheat pasta",
                    "Crisp, thin air and alpine cold. Wear thermal layers. (5°C - 18°C)"
            ));

            destinationRepository.save(new Destination(
                    "Hampi Ruins", "Karnataka", "Hampi", "Historical",
                    "A UNESCO World Heritage site displaying the scattered stone ruins of the magnificent 14th-century Vijayanagara Empire.",
                    4.7, "https://images.unsplash.com/photo-1600100397608-f010f423b971?w=800",
                    "Virupaksha Temple, Stone Chariot at Vittala Temple, Lotus Mahal, Matanga Hill",
                    "Bisi Bele Bath, Mysore Pak, Traditional South Indian Thali",
                    "Sunny and dry. Perfect for exploring stone architecture. (22°C - 34°C)"
            ));

            destinationRepository.save(new Destination(
                    "Rishikesh Valley", "Uttarakhand", "Rishikesh", "Adventure",
                    "Known as the Yoga Capital of the World, Rishikesh offers rapid whitewater rafting on the Ganges and serene valley retreats.",
                    4.8, "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
                    "Laxman Jhula suspension bridge, Triveni Ghat Aarti, Beatles Ashram, Shivpuri rafting camp",
                    "Aloo Puri breakfast, Organic health salads, Ginger Honey Tea",
                    "Cool mountain air. Delightful and clean climate. (15°C - 28°C)"
            ));

            destinationRepository.save(new Destination(
                    "Ooty Hills", "Tamil Nadu", "Ooty", "Adventure",
                    "A serene hill station in the Nilgiri Hills, featuring emerald tea gardens, quiet lakes, and colonial architecture.",
                    4.7, "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800",
                    "Ooty Botanical Gardens, Pykara Lake, Doddabetta Peak, Nilgiri Mountain Toy Train",
                    "Ooty Varkey biscuits, Fresh Homemade chocolates, Masala Tea",
                    "Cool, misty mountain air. Extremely refreshing. (12°C - 22°C)"
            ));

            destinationRepository.save(new Destination(
                    "Hyderabad Biryani Tour", "Telangana", "Hyderabad", "Food",
                    "The historic city of Nizams famous for magnificent fort structures and globally celebrated Mughlai-influenced cuisines.",
                    4.8, "https://images.unsplash.com/photo-1608957541552-87052c3d80d2?w=800",
                    "Charminar, Golconda Fort, Hussain Sagar Lake, Chowmahalla Palace",
                    "Hyderabadi Dum Biryani, Haleem, Double Ka Meetha, Irani Chai",
                    "Pleasant and warm. Perfect evening food temperatures. (22°C - 33°C)"
            ));

            System.out.println(">>> Indian destinations seeded successfully.");
        }
    }

    private void seedReviews() {
        if (reviewRepository.count() == 0) {
            reviewRepository.save(new Review(
                    "Rajesh Kumar",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
                    "Hyderabad",
                    5,
                    "The AI-generated itinerary for Ladakh was spot on! It helped me acclimatize perfectly and saved me hours of research."
            ));

            reviewRepository.save(new Review(
                    "Ananya Sharma",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
                    "Mumbai",
                    5,
                    "This claymorphic UI looks absolutely stunning! Planning our family trip to Kerala was incredibly smooth and visually delightful."
            ));

            reviewRepository.save(new Review(
                    "David Miller",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
                    "New York",
                    5,
                    "Being a foreign traveler, the map-based exploration of Indian historical spots was a life saver. Highly recommend the Varanasi temple guide!"
            ));

            System.out.println(">>> User testimonials seeded successfully.");
        }
    }
}
