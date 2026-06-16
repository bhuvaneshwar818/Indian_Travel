import React, { useState, useEffect } from 'react'
import { useTripStore } from '../store/tripStore'
import { useAuthStore } from '../store/authStore'
import { Search, MapPin, Sparkles, Star, Plus, Check, Compass, Info, CloudSun, Utensils, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import India from '@svg-maps/india'

const STATES = [
  "all",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
]

const CATEGORIES = ["all", "Beaches", "Historical", "Temples", "Adventure", "Food"]

const STATE_ID_MAP = {
  "Andaman and Nicobar Islands": "an",
  "Andhra Pradesh": "ap",
  "Arunachal Pradesh": "ar",
  "Assam": "as",
  "Bihar": "br",
  "Chandigarh": "ch",
  "Chhattisgarh": "ct",
  "Dadra and Nagar Haveli": "dn",
  "Daman and Diu": "dd",
  "Delhi": "dl",
  "Goa": "ga",
  "Gujarat": "gj",
  "Haryana": "hr",
  "Himachal Pradesh": "hp",
  "Jammu & Kashmir": "jk",
  "Ladakh": "jk",
  "Jharkhand": "jh",
  "Karnataka": "ka",
  "Kerala": "kl",
  "Lakshadweep": "ld",
  "Madhya Pradesh": "mp",
  "Maharashtra": "mh",
  "Manipur": "mn",
  "Meghalaya": "ml",
  "Mizoram": "mz",
  "Nagaland": "nl",
  "Odisha": "or",
  "Puducherry": "py",
  "Punjab": "pb",
  "Rajasthan": "rj",
  "Sikkim": "sk",
  "Tamil Nadu": "tn",
  "Telangana": "tg",
  "Tripura": "tr",
  "Uttar Pradesh": "up",
  "Uttarakhand": "ut",
  "West Bengal": "wb"
}

const ID_STATE_MAP = {
  "an": "Andaman and Nicobar Islands",
  "ap": "Andhra Pradesh",
  "ar": "Arunachal Pradesh",
  "as": "Assam",
  "br": "Bihar",
  "ch": "Chandigarh",
  "ct": "Chhattisgarh",
  "dn": "Dadra and Nagar Haveli",
  "dd": "Daman and Diu",
  "dl": "Delhi",
  "ga": "Goa",
  "gj": "Gujarat",
  "hr": "Haryana",
  "hp": "Himachal Pradesh",
  "jk": "Jammu & Kashmir",
  "jh": "Jharkhand",
  "ka": "Karnataka",
  "kl": "Kerala",
  "ld": "Lakshadweep",
  "mp": "Madhya Pradesh",
  "mh": "Maharashtra",
  "mn": "Manipur",
  "ml": "Meghalaya",
  "mz": "Mizoram",
  "nl": "Nagaland",
  "or": "Odisha",
  "py": "Puducherry",
  "pb": "Punjab",
  "rj": "Rajasthan",
  "sk": "Sikkim",
  "tn": "Tamil Nadu",
  "tg": "Telangana",
  "tr": "Tripura",
  "up": "Uttar Pradesh",
  "ut": "Uttarakhand",
  "wb": "West Bengal"
}

const FALLBACK_DESTINATIONS = {
  "Maharashtra": [
    {
      id: "mh-1",
      name: "Gateway of India & Marine Drive",
      city: "Mumbai",
      state: "Maharashtra",
      category: "Historical",
      description: "Witness the majestic colonial archway of the Gateway of India facing the Arabian Sea, followed by a scenic sunset walk along the Queen's necklace curve at Marine Drive.",
      rating: 4.8,
      imageUrl: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=600",
      foodSpots: "Pav Bhaji at Sardar, Bun Maska at Kyani & Co.",
      weatherInfo: "Humid tropical breezes (25°C - 33°C)",
      famousPlaces: "Marine Drive, Gateway of India, Colaba Causeway"
    },
    {
      id: "mh-2",
      name: "Ajanta & Ellora Caves",
      city: "Aurangabad",
      state: "Maharashtra",
      category: "Historical",
      description: "Explore the extraordinary UNESCO World Heritage site consisting of 34 rock-cut temples and caves displaying unmatched ancient architectural brilliance.",
      rating: 4.9,
      imageUrl: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=600",
      foodSpots: "Naan Qalia, Aurangabadi Mughlai thali",
      weatherInfo: "Dry and sunny (22°C - 34°C)",
      famousPlaces: "Kailash Temple (Cave 16), Ajanta Caves, Ellora Caves"
    }
  ],
  "Gujarat": [
    {
      id: "gj-1",
      name: "Rann of Kutch Salt Desert",
      city: "Bhuj",
      state: "Gujarat",
      category: "Adventure",
      description: "Experience the mesmerizing white salt plains of the Great Rann of Kutch, glowing beautifully under the full moon light during the Rann Utsav.",
      rating: 4.9,
      imageUrl: "https://images.unsplash.com/photo-1627918804791-dc67c1328052?w=600",
      foodSpots: "Kutchi Dabeli, Traditional Gujarati Thali",
      weatherInfo: "Cool desert nights and sunny days (15°C - 30°C)",
      famousPlaces: "White Desert, Kalo Dungar, Mandvi Beach"
    },
    {
      id: "gj-2",
      name: "Gir National Lion Sanctuary",
      city: "Junagadh",
      state: "Gujarat",
      category: "Adventure",
      description: "Embark on an open-jeep jungle safari to witness the majestic Asiatic Lions in their only natural habitat in the world.",
      rating: 4.8,
      imageUrl: "https://images.unsplash.com/photo-1590760450581-2c057e6a1418?w=600",
      foodSpots: "Kathiyawadi Thali, Bajra no Rotlo",
      weatherInfo: "Dry deciduous forest breeze (20°C - 35°C)",
      famousPlaces: "Kamleshwar Dam, Gir Interpretation Zone, Sasan Gir"
    }
  ],
  "Punjab": [
    {
      id: "pb-1",
      name: "Harmandir Sahib (Golden Temple)",
      city: "Amritsar",
      state: "Punjab",
      category: "Temples",
      description: "The most sacred spiritual shrine of Sikhism, famous for its glowing golden dome, peaceful holy sarovar lake, and the legendary community kitchen (Langar).",
      rating: 4.9,
      imageUrl: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=600",
      foodSpots: "Amritsari Kulcha at Bhai Kulwant Singh, Kesar Da Dhaba",
      weatherInfo: "Pleasant seasonal air (15°C - 30°C)",
      famousPlaces: "Jallianwala Bagh, Wagah Border Ceremony, Partition Museum"
    }
  ],
  "West Bengal": [
    {
      id: "wb-1",
      name: "Darjeeling Tea Estates",
      city: "Darjeeling",
      state: "West Bengal",
      category: "Adventure",
      description: "Breathe in the fresh mountain air of Darjeeling tea estates, facing the grand snow-covered peaks of Mount Kanchenjunga.",
      rating: 4.8,
      imageUrl: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?w=600",
      foodSpots: "Steamed momos at Kunga, Darjeeling Muscatel Tea",
      weatherInfo: "Cool misty mountain breezes (10°C - 20°C)",
      famousPlaces: "Tiger Hill Sunrise, Ghoom Monastery, Batasia Loop"
    }
  ],
  "Himachal Pradesh": [
    {
      id: "hp-1",
      name: "Manali Solang Valley",
      city: "Manali",
      state: "Himachal Pradesh",
      category: "Adventure",
      description: "A gorgeous mountain resort town offering adventure sports like paragliding, skiing, and base camps for high mountain trails.",
      rating: 4.8,
      imageUrl: "https://images.unsplash.com/photo-1597075095400-b1d3d1ab2472?w=600",
      foodSpots: "Trout Fish, Siddu with ghee, Himachali Dham",
      weatherInfo: "Cold alpine mountain climate (8°C - 22°C)",
      famousPlaces: "Hadimba Temple, Solang Valley, Rohtang Pass, Mall Road"
    }
  ]
}

const getDynamicDestinations = (selectedState, apiDestinations) => {
  if (selectedState === 'all') return apiDestinations;
  if (apiDestinations.length > 0) return apiDestinations.filter(d => d.state === selectedState);
  
  if (FALLBACK_DESTINATIONS[selectedState]) {
    return FALLBACK_DESTINATIONS[selectedState];
  }
  
  return [
    {
      id: `${selectedState}-dyn1`,
      name: `${selectedState} Heritage Hub`,
      city: "Capital City",
      state: selectedState,
      category: "Historical",
      description: `Explore the beautiful heritage sights, local cultural festivals, and pristine landscapes across ${selectedState}. Tap our AI Trip Planner wizard to get a complete custom itinerary!`,
      rating: 4.7,
      imageUrl: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600",
      foodSpots: "Traditional local thali and regional desserts",
      weatherInfo: "Warm, comfortable seasonal climate (22°C - 32°C)",
      famousPlaces: "City Palace, Heritage Museum, Local Markets"
    },
    {
      id: `${selectedState}-dyn2`,
      name: `${selectedState} Nature Reserve`,
      city: "Scenic Valley",
      state: selectedState,
      category: "Adventure",
      description: `Embark on an outdoor trail to discover hidden valleys, lush green forests, and serene lake viewpoints in the heart of ${selectedState}.`,
      rating: 4.8,
      imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
      foodSpots: "Fresh local organic specialties and hot spiced teas",
      weatherInfo: "Fresh mountain and valley air (18°C - 28°C)",
      famousPlaces: "Sunset Point, Nature Trails, Lake Sanctuary"
    }
  ];
}


const stateData = {
  "all": {
    sights: ["Select any state below to view sights!"],
    food: "Select a state to explore dishes",
    rating: 5.0,
    category: "All Regions",
    weather: "Varies by selected region",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400",
    desc: "Select a state from the dropdown or click on the interactive India map to explore popular places, localized dishes, and matched destinations instantly!"
  },
  "Andhra Pradesh": {
    sights: ["Araku Valley", "Tirupati Temple", "Borra Caves", "Vizag Beaches"],
    food: "Spicy Andhra Meals, Pesarattu, Gongura Pachadi",
    rating: 4.8,
    category: "Temples",
    weather: "Tropical and warm with coastal breezes (24°C - 33°C)",
    image: "https://images.unsplash.com/photo-1601999109332-542b18dbec57?w=400",
    desc: "Famous for its scenic Araku hill station, the sacred hills of Tirumala, pristine Vizag beaches, and fiery traditional cuisine."
  },
  "Arunachal Pradesh": {
    sights: ["Tawang Monastery", "Ziro Valley", "Sela Pass", "Namdapha Park"],
    food: "Thukpa, Zan millet porridge, Bamboo Shoot stir-fry",
    rating: 4.9,
    category: "Adventure",
    weather: "Cool alpine mist, refreshing breezes (10°C - 20°C)",
    image: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?w=400",
    desc: "The 'Land of the Rising Sun', featuring snow-capped peaks, mist-laden valleys, and pristine tribal cultures."
  },
  "Assam": {
    sights: ["Kaziranga National Park", "Kamakhya Temple", "Majuli Island"],
    food: "Masor Tenga sour fish curry, Duck with Ash Gourd",
    rating: 4.8,
    category: "Nature",
    weather: "Humid and pleasant with river breezes (20°C - 28°C)",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400",
    desc: "Renowned for its aromatic tea gardens, the rare one-horned rhinoceros in Kaziranga, and the sprawling Brahmaputra river views."
  },
  "Bihar": {
    sights: ["Mahabodhi Temple", "Nalanda University ruins", "Rajgir Ropeway"],
    food: "Litti Chokha, Sattu Paratha, Khaja sweet",
    rating: 4.7,
    category: "Historical",
    weather: "Sunny days with pleasant river mist (18°C - 32°C)",
    image: "https://images.unsplash.com/photo-1600100397608-f010f423b971?w=400",
    desc: "A land deeply rooted in ancient history where Lord Buddha attained enlightenment, home to the glorious Nalanda university."
  },
  "Chhattisgarh": {
    sights: ["Chitrakote Waterfalls", "Bastar Palace", "Tirathgarh Falls"],
    food: "Chila rice crepe, Muthiya, Bafauri",
    rating: 4.6,
    category: "Nature",
    weather: "Dry deciduous woodlands climate (22°C - 33°C)",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=400",
    desc: "India's hidden green heartland, boasting the majestic 'Niagara of India' (Chitrakote), rich tribal heritage, and dense forests."
  },
  "Goa": {
    sights: ["Baga Beach", "Calangute Beach", "Fort Aguada", "Dudhsagar Falls"],
    food: "Prawn Balchao, Fish Curry, Bebinca dessert",
    rating: 4.8,
    category: "Beaches",
    weather: "Warm tropical breezes (28°C - 33°C)",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
    desc: "A sun-kissed paradise known for its endless sandy shores, active night shacks, and historical Portuguese churches."
  },
  "Gujarat": {
    sights: ["Rann of Kutch Salt Desert", "Gir Lion Sanctuary", "Somnath Temple", "Statue of Unity"],
    food: "Gujarati Thali, Dhokla, Kutchi Dabeli, Rotlo",
    rating: 4.8,
    category: "Adventure",
    weather: "Bright, sunny and dry desert air (18°C - 34°C)",
    image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=400",
    desc: "A state of vibrant business, diverse ecosystems, the vast salt deserts of Kutch, and the last home of Asiatic Lions in Gir."
  },
  "Haryana": {
    sights: ["Sultanpur Bird Sanctuary", "Kurukshetra Heritage Sites", "Pinjore Gardens"],
    food: "Bajra Khichri, Singri ki Sabzi, Kadhi Pakora",
    rating: 4.5,
    category: "Historical",
    weather: "Warm summers and pleasant winter afternoons (15°C - 32°C)",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0db?w=400",
    desc: "Rich in agricultural heritage and Mahabharata epic lore, offering modern urban hubs like Gurugram and historic Kurukshetra."
  },
  "Himachal Pradesh": {
    sights: ["Rohtang Pass", "Solang Valley", "Shimla Mall Road", "Dharamshala"],
    food: "Siddu with Ghee, Himachali Dham, Grilled River Trout",
    rating: 4.9,
    category: "Adventure",
    weather: "Cool mountain air, crisp alpine breezes (5°C - 20°C)",
    image: "https://images.unsplash.com/photo-1597075095400-b1d3d1ab2472?w=400",
    desc: "A gorgeous mountain playground filled with snow-clad valleys, dense pine forests, and charming colonial hill towns."
  },
  "Jammu & Kashmir": {
    sights: ["Srinagar Houseboats", "Gulmarg Gondola", "Pahalgam Valley", "Amarnath Cave"],
    food: "Rogan Josh, Kashmiri Kahwa, Gustaba, Yakhni",
    rating: 4.9,
    category: "Adventure",
    weather: "Cool, refreshing mountain air & snow valleys (5°C - 22°C)",
    image: "https://images.unsplash.com/photo-1581793745862-99f57567af25?w=400",
    desc: "The 'Paradise on Earth', legendary for its beautiful snow slopes in Gulmarg, pristine houseboats on Dal Lake, and royal gardens."
  },
  "Jharkhand": {
    sights: ["Dassam Falls", "Baidyanath Temple", "Betla National Park"],
    food: "Dhuska with chana curry, Litti, Rugra mushrooms",
    rating: 4.6,
    category: "Nature",
    weather: "Mild climate with forest breezes (20°C - 30°C)",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=400",
    desc: "The 'Land of Forests', famous for its rolling waterfalls, tribal wood crafts, and highly revered spiritual shrines."
  },
  "Karnataka": {
    sights: ["Hampi Stone Chariot", "Virupaksha Ruins", "Mysore Palace", "Coorg Hills"],
    food: "Bisi Bele Bath, Mysore Pak, Traditional Rava Idli",
    rating: 4.7,
    category: "Historical",
    weather: "Dry, sunny, and moderate exploration climate (22°C - 34°C)",
    image: "https://images.unsplash.com/photo-1600100397608-f010f423b971?w=400",
    desc: "Home to the stunning 14th-century architectural ruins of the Vijayanagara Empire scattered across boulders in Hampi."
  },
  "Kerala": {
    sights: ["Alleppey Houseboats", "Munnar Tea Estates", "Athirappilly Falls"],
    food: "Karimeen Pollichathu, Sadya Feast, Appam with stew",
    rating: 4.9,
    category: "Beaches",
    weather: "Humid and pleasant coastal climate (25°C - 31°C)",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=400",
    desc: "Often referred to as 'God's Own Country', Kerala is defined by serene backwaters, palm-fringed rivers, and spice orchards."
  },
  "Ladakh": {
    sights: ["Pangong Lake", "Nubra Valley", "Khardung La Pass", "Hemis Monastery"],
    food: "Thukpa noodle soup, Steamed Momos, Butter Tea",
    rating: 4.9,
    category: "Adventure",
    weather: "Alpine cold, crisp and thin air (5°C - 18°C)",
    image: "https://images.unsplash.com/photo-1581793745862-99f57567af25?w=400",
    desc: "A high-altitude marvel marked by jagged snowbound passes, deep crystal lakes, and historic Tibetan spiritual monasteries."
  },
  "Madhya Pradesh": {
    sights: ["Khajuraho Temples", "Kanha Tiger Reserve", "Sanchi Stupa", "Gwalior Fort"],
    food: "Poha Jalebi, Bhutte Ka Kees, Mawa Bati",
    rating: 4.8,
    category: "Historical",
    weather: "Warm tropical heartland air (20°C - 33°C)",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400",
    desc: "The central heartland of India, housing majestic medieval forts, famous wildlife national parks, and ancient rock temples."
  },
  "Maharashtra": {
    sights: ["Gateway of India", "Ajanta & Ellora Caves", "Lonavala Hills", "Mahabaleshwar"],
    food: "Vada Pav, Misal Pav, Puran Poli thali",
    rating: 4.8,
    category: "Historical",
    weather: "Coastal humid air and pleasant hill breezes (22°C - 32°C)",
    image: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=400",
    desc: "A vibrant powerhouse state featuring the bustling city of Mumbai, spectacular rock-cut heritage caves, and lush Western Ghats."
  },
  "Manipur": {
    sights: ["Loktak Floating Lake", "Keibul Lamjao Park", "Kangla Fort"],
    food: "Kangshoi stew, Eromba fish paste mash, Singju salad",
    rating: 4.7,
    category: "Nature",
    weather: "Refreshing valley climate, clean air (15°C - 25°C)",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
    desc: "Famous for the magical floating Loktak Lake, the world's only floating national park, and exquisite classical dance heritage."
  },
  "Meghalaya": {
    sights: ["Living Root Bridges", "Cherrapunji Rain Trails", "Dawki River"],
    food: "Jadoh spiced rice, Doh-neiiong, Tungrymbai",
    rating: 4.9,
    category: "Adventure",
    weather: "Misty mountain air, frequent showers (12°C - 20°C)",
    image: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?w=400",
    desc: "The 'Abode of Clouds', featuring breathtaking biological root bridges, deep green ravines, and crystal clear mountain waters in Dawki."
  },
  "Mizoram": {
    sights: ["Vantawng Waterfalls", "Phawngpui Blue Mountain", "Reiek Village"],
    food: "Bai pork and bamboo shoot stew, Sawhchiar, Vawksa Rep",
    rating: 4.7,
    category: "Nature",
    weather: "Mild mountain air and pine valley mist (14°C - 24°C)",
    image: "https://images.unsplash.com/photo-1581793745862-99f57567af25?w=400",
    desc: "A pristine land of rolling blue hills, bamboo forests, cascading high waterfalls, and warm tribal hospitality."
  },
  "Nagaland": {
    sights: ["Dzukou Valley Trek", "Kohima War Cemetery", "Kisama Village"],
    food: "Smoked Pork with Anishi, Galho porridge, Bamboo Shoot curry",
    rating: 4.8,
    category: "Adventure",
    weather: "Cool montane climate, refreshing wind (12°C - 22°C)",
    image: "https://images.unsplash.com/photo-1581793745862-99f57567af25?w=400",
    desc: "Famous for its spectacular Hornbill Festival, emerald-green Dzukou Valley flower treks, and rich Naga tribal history."
  },
  "Odisha": {
    sights: ["Konark Sun Temple", "Puri Jagannath Temple", "Chilika Dolphin Lake"],
    food: "Chena Poda dessert, Dalma, Pakhala Bhat",
    rating: 4.7,
    category: "Temples",
    weather: "Warm tropical coastal breeze (24°C - 32°C)",
    image: "https://images.unsplash.com/photo-1600100397608-f010f423b971?w=400",
    desc: "Home to the monumental Sun Temple at Konark, golden Puri beaches, and Asia's largest brackish water dolphin lagoon."
  },
  "Punjab": {
    sights: ["Golden Temple", "Jallianwala Bagh", "Wagah Border Ceremony"],
    food: "Amritsari Kulcha, Butter Chicken, Makki di Roti & Sarson ka Saag",
    rating: 4.9,
    category: "Food",
    weather: "Cool pleasant winters and bright sunny days (15°C - 30°C)",
    image: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=400",
    desc: "The land of five rivers, celebrated for its golden spiritual heart, energetic Bhangra beats, and world-class dairy-rich cuisine."
  },
  "Rajasthan": {
    sights: ["Hawa Mahal", "Amber Fort", "Jodhpur Desert Safari", "Lake Pichola"],
    food: "Dal Baati Churma, Pyaaz Kachori, Ghevar sweet",
    rating: 4.8,
    category: "Historical",
    weather: "Sunny and dry desert evenings (20°C - 32°C)",
    image: "https://images.unsplash.com/photo-1477584322811-591f423758b7?w=400",
    desc: "A land of majestic forts, royal palaces, desert dunes, and rich historical legends that speak of royal heritage."
  },
  "Sikkim": {
    sights: ["Gurudongmar Lake", "Nathula Pass", "Gangtok Ropeway", "Rumtek Monastery"],
    food: "Thukpa soup, Phagshapa, Steamed Momos with fiery sauce",
    rating: 4.9,
    category: "Adventure",
    weather: "Cold high-alpine air, crisp white snow view (5°C - 16°C)",
    image: "https://images.unsplash.com/photo-1581793745862-99f57567af25?w=400",
    desc: "A mystical Himalayan state framing the majestic Mt. Kanchenjunga, high mountain passes, and stunning Buddhist monasteries."
  },
  "Tamil Nadu": {
    sights: ["Ooty Tea Estates", "Doddabetta Peak", "Madurai Meenakshi Temple", "Rameshwaram"],
    food: "Idli Sambar, Ooty Varkey, Homemade Chocolate",
    rating: 4.7,
    category: "Adventure",
    weather: "Misty hill station climate, cool breezes (12°C - 22°C)",
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=400",
    desc: "Features beautiful mist-filled hill stations in Ooty and sprawling Dravidian-style sculpted temples."
  },
  "Telangana": {
    sights: ["Charminar Fort", "Golconda Fort", "Ramappa Temple"],
    food: "Hyderabadi Biryani, Haleem, Double Ka Meetha",
    rating: 4.8,
    category: "Food",
    weather: "Warm and dry inland climate (24°C - 35°C)",
    image: "https://images.unsplash.com/photo-1608957541552-87052c3d80d2?w=400",
    desc: "Famous for its glorious Charminar, massive Golconda Fort ruins, and the world-renowned Hyderabadi culinary heritage."
  },
  "Tripura": {
    sights: ["Neermahal Water Palace", "Unakoti Rock Carvings", "Ujjayanta Palace"],
    food: "Mui Borok, Chakhwi, Bamboo shoot stir fry",
    rating: 4.7,
    category: "Historical",
    weather: "Warm tropical moisture, light river breezes (20°C - 30°C)",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
    desc: "A tiny royal state featuring the beautiful floating Neermahal palace and giant ancient rock carvings at Unakoti."
  },
  "Uttar Pradesh": {
    sights: ["Taj Mahal in Agra", "Varanasi Ganges Ghats", "Sarnath Buddhist Stupa"],
    food: "Banarasi Lassi, Kachori Sabzi, Petha sweet",
    rating: 4.9,
    category: "Temples",
    weather: "Pleasant river mist and warm sunlight (18°C - 33°C)",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0db?w=400",
    desc: "The spiritual heartland of India, housing the eternal city of Varanasi on the Ganges and the legendary monument of love - the Taj Mahal."
  },
  "Uttarakhand": {
    sights: ["Rishikesh Rafting", "Valley of Flowers", "Mussoorie Hills", "Kedarnath Temple"],
    food: "Kafuli, Phaanu, Bal Mithai sweet",
    rating: 4.9,
    category: "Adventure",
    weather: "Fresh Himalayan air, cold mountain evenings (8°C - 20°C)",
    image: "https://images.unsplash.com/photo-1597075095400-b1d3d1ab2472?w=400",
    desc: "Known as 'Devbhumi' or Land of Gods, boasting high-adrenaline river rafting, sacred mountain shrines, and beautiful flower valley walks."
  },
  "West Bengal": {
    sights: ["Darjeeling Tea Gardens", "Sundarbans Tiger Reserve", "Victoria Memorial"],
    food: "Macher Jhol fish curry, Sandesh sweet, Kathi Rolls",
    rating: 4.8,
    category: "Historical",
    weather: "Coastal moisture and cool mountain ridge winds (12°C - 30°C)",
    image: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?w=400",
    desc: "A hub of art and literature, offering mist-covered tea slopes in Darjeeling, tiger reserves in Sundarbans, and colonial history in Kolkata."
  }
}

export default function SearchDropdowns() {
  const { destinations, bookmarks, fetchDestinations, fetchBookmarks, addBookmark, removeBookmark, loading } = useTripStore()
  const { isAuthenticated } = useAuthStore()

  const [state, setState] = useState("all")
  const [category, setCategory] = useState("all")
  const [hoveredState, setHoveredState] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [activeInfoId, setActiveInfoId] = useState(null)
  
  // Floating cursor tooltip state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Ref + state to lock right panel height to left column height
  const leftColRef = React.useRef(null)
  const [rightPanelHeight, setRightPanelHeight] = useState(null)

  // Observe left column height changes and sync right panel
  useEffect(() => {
    const el = leftColRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      setRightPanelHeight(el.offsetHeight)
    })
    observer.observe(el)
    setRightPanelHeight(el.offsetHeight)
    return () => observer.disconnect()
  }, [])

  // Fetch bookmarks on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchBookmarks()
    }
  }, [fetchBookmarks, isAuthenticated])

  // Dynamic E2E Reactive Filtering whenever state or category changes
  useEffect(() => {
    fetchDestinations(state, category)
  }, [state, category, fetchDestinations])

  // Simple rule-based dynamic AI recommendations / suggestions
  useEffect(() => {
    const list = []
    if (category === 'Beaches') {
      list.push("Goa: Beaches and shacks", "Kerala: Backwaters and canals")
    } else if (category === 'Historical') {
      list.push("Jaipur: Forts and royal palaces", "Karnataka: Stone ruins of Hampi")
    } else if (category === 'Temples') {
      list.push("Varanasi: Ganga river ghats & Aarti", "Madurai: Ancient Dravidian temples")
    } else if (category === 'Adventure') {
      list.push("Ladakh: High mountain desert treks", "Rishikesh: River rafting and base camp")
    } else if (category === 'Food') {
      list.push("Hyderabad: Mughlai Biryani tour", "Varanasi: Alleys food exploration")
    } else {
      list.push("Goa Beaches: Highly popular now!", "Jaipur Heritage: Splendid family vacation", "Leh Ladakh: High alpine trek choice")
    }
    setSuggestions(list)
  }, [category])

  const isBookmarked = (destId) => {
    return bookmarks.some((b) => b.id === destId)
  }

  const handleBookmarkToggle = (destId) => {
    if (!isAuthenticated) {
      alert("Please log in to save destinations to your wishlist!")
      return
    }
    if (isBookmarked(destId)) {
      removeBookmark(destId)
    } else {
      addBookmark(destId)
    }
  }

  // Handle cursor positioning for floating tooltip
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  const currentStateData = stateData[state] || {
    sights: ["Coming Soon!", "We are currently mapping active spots here."],
    food: "Local culinary reviews under development",
    rating: 4.5,
    category: "New Region",
    weather: "Varies by seasonal conditions",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400",
    desc: `We are currently mapping out popular destinations, culinary spots, and heritage sights in ${state}. Click a glowing travel hub like Rajasthan, Goa, or Kerala to explore active spots!`
  };

  const displayedDestinations = getDynamicDestinations(state, destinations);

  return (
    <section id="destinations" className="py-24 bg-slate-50 dark:bg-[#0A0516] relative overflow-hidden">
      
      {/* Decorative Orbs */}
      <div className="neon-glow-circle w-[350px] h-[350px] bg-primary/10 top-10 right-10 animate-pulse-glow"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900 dark:text-white">
            Search by <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Interactive Explorer</span>
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-350 font-medium">
            Select parameters from the dropdown, or click directly on the interactive India map to explore famous attractions and matched destinations.
          </p>
        </div>

        {/* COMBINED SPLIT HALF-SCREEN PANEL */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: Dropdown Form + SVG Map */}
          <div ref={leftColRef} className="w-full lg:w-[42%] flex-shrink-0 flex flex-col gap-6 text-left">
            
            {/* Claymorphic Filter Panel */}
            <div className="clay-card p-6 bg-white/80 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* State Select */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">State</label>
                  <select
                    id="state-selector-input"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100 cursor-pointer"
                  >
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s === 'all' ? 'All States' : s}</option>
                    ))}
                  </select>
                </div>

                {/* Category Select */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-850 dark:bg-slate-950 dark:text-slate-100 cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* AI Suggestion Chips */}
              <div className="mt-5 pt-4 border-t border-slate-200/50 dark:border-slate-800/40 text-left flex flex-col gap-2">
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-primary uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse-glow" />
                  <span>AI Suggestions:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((sug) => (
                    <span 
                      key={sug} 
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 border border-indigo-100 text-indigo-755 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-300"
                    >
                      {sug}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Map wrapper — restored to original aspect-square */}
            <div
              className="clay-card p-4 md:p-6 bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 shadow-inner flex items-center justify-center w-full relative aspect-square rounded-2xl"
            >
              
              {/* Native sharp scalable Vector Map of India */}
              <svg 
                viewBox={India.viewBox} 
                className="w-full h-full z-10 transition-all select-none drop-shadow-2xl"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* State Vector Paths */}
                <g className="india-map-grid">
                  {India.locations.map((loc) => {
                    const dbStateName = ID_STATE_MAP[loc.id] || loc.name;
                    const isSelected = state === dbStateName;
                    const isHovered = hoveredState === dbStateName;

                    let pathClass = "transition-all duration-300 outline-none select-none cursor-pointer ";
                    if (isSelected) {
                      pathClass += "fill-primary/25 stroke-primary stroke-[2.5px] drop-shadow-[0_0_15px_rgba(139,92,246,0.65)]";
                    } else {
                      pathClass += "fill-indigo-500/10 stroke-indigo-400/45 hover:fill-primary/20 hover:stroke-primary hover:stroke-[1.5px] hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]";
                    }

                    return (
                      <path 
                        key={loc.id}
                        id={loc.id}
                        name={loc.name}
                        d={loc.path}
                        className={pathClass}
                        onClick={() => {
                          const dbState = ID_STATE_MAP[loc.id] || loc.name;
                          setState(dbState);
                        }}
                        onMouseEnter={() => setHoveredState(dbStateName)}
                        onMouseLeave={() => setHoveredState(null)}
                      />
                    );
                  })}
                </g>
              </svg>

              {/* FLOATING CURSOR TOOLTIP */}
              <AnimatePresence>
                {hoveredState && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute bg-slate-950/90 text-white font-extrabold text-[11px] px-3.5 py-2 rounded-xl border border-slate-700/80 shadow-2xl pointer-events-none z-[99999] tracking-wide flex items-center gap-2 backdrop-blur-md"
                    style={{ 
                      left: `${mousePos.x + 15}px`, 
                      top: `${mousePos.y + 15}px` 
                    }}
                  >
                    <span>{hoveredState} <span className="text-primary-light font-bold text-[9px] uppercase ml-1">(Click to Explore)</span></span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Right Column: Matched Sights — height locked to left column via JS ref */}
          <div
            className="flex-1 flex flex-col gap-4 text-left"
            style={{ height: rightPanelHeight ? `${rightPanelHeight}px` : 'auto' }}
          >
            
            {/* Sights Header Panel */}
            <div className="flex-shrink-0 flex justify-between items-center bg-white/40 dark:bg-slate-900/20 p-4 rounded-2xl border border-slate-200/30 dark:border-slate-800/20 shadow-sm flex-wrap gap-4">
              <div>
                <h3 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
                  Matched Sights <span className="text-primary-light">({displayedDestinations.length})</span>
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">Instant database queries filtered by your selections.</p>
              </div>
              
              {state !== "all" && (
                <button 
                  onClick={() => { setState("all"); setCategory("all"); }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-350 text-slate-750 font-bold text-xs rounded-xl transition-all dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-slate-200"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {/* Scrollable list — fills all remaining height in the right panel */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex flex-col gap-5 pb-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                  <p className="text-sm font-semibold text-slate-500">Searching active spots...</p>
                </div>
              ) : displayedDestinations.length === 0 ? (
                <div className="clay-card p-12 text-center bg-white/70 max-w-lg mx-auto w-full dark:bg-slate-900/60">
                  <Compass className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">No locations found</h3>
                  <p className="mt-1 text-sm text-slate-550">Try selecting another state, another category, or clear filters.</p>
                </div>
              ) : (
                displayedDestinations.map((dest) => (
                  <motion.div
                    key={dest.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="clay-card group overflow-hidden flex flex-col sm:flex-row bg-white/90 dark:bg-slate-900/70 hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 w-full min-h-[200px]"
                  >
                    
                    {/* Left side: Image Container — wider & taller */}
                    <div className="relative w-full sm:w-[280px] md:w-[300px] h-56 sm:h-auto overflow-hidden flex-shrink-0">
                      <img 
                        src={dest.imageUrl} 
                        alt={dest.name} 
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      {/* Dark overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/60 via-black/10 to-transparent"></div>
                      
                      {/* Floating Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="px-3.5 py-1.5 text-[11px] font-extrabold rounded-xl bg-primary text-white uppercase shadow-lg tracking-wider">
                          {dest.category}
                        </span>
                      </div>

                      {/* Rating badge */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-white/95 px-3 py-1.5 rounded-xl text-slate-900 text-sm font-extrabold shadow-md">
                        <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                        <span>{dest.rating}</span>
                      </div>
                    </div>

                    {/* Right side: Info Details */}
                    <div className="p-6 md:p-7 flex-grow text-left flex flex-col justify-between gap-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-2xl font-display font-extrabold text-slate-950 dark:text-white flex items-center gap-2 leading-tight">
                              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                              <span className="truncate">{dest.name}</span>
                            </h3>
                            <p className="mt-1.5 text-sm font-bold text-slate-400 tracking-widest uppercase">{dest.city}, {dest.state}</p>
                          </div>
                          
                          {/* Plus / Check wishlist button */}
                          <button
                            onClick={() => handleBookmarkToggle(dest.id)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 flex-shrink-0 ${
                              isBookmarked(dest.id)
                                ? 'bg-emerald-500 border-2 border-emerald-400 text-white'
                                : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-primary hover:text-primary dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary dark:hover:text-primary'
                            }`}
                            title={isBookmarked(dest.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                          >
                            {isBookmarked(dest.id) 
                              ? <Check className="w-5 h-5 stroke-[2.5]" /> 
                              : <Plus className="w-5 h-5 stroke-[2.5]" />}
                          </button>
                        </div>

                        <p className="text-base text-slate-600 dark:text-slate-350 leading-relaxed font-medium line-clamp-3">{dest.description}</p>
                      </div>

                      {/* Bottom Actions Drawer */}
                      <div className="mt-2">
                        {activeInfoId === dest.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 p-4 rounded-2xl bg-slate-100/60 border border-slate-200/60 dark:bg-slate-950/50 dark:border-slate-800/50 text-sm space-y-2.5"
                          >
                            <div className="flex items-start gap-2">
                              <Utensils className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              <p className="text-slate-700 dark:text-slate-300"><strong>Food:</strong> {dest.foodSpots}</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <CloudSun className="w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0" />
                              <p className="text-slate-700 dark:text-slate-300"><strong>Weather:</strong> {dest.weatherInfo}</p>
                            </div>
                            <div className="pt-1 text-xs text-slate-500 dark:text-slate-400">
                              <strong>Top Spots:</strong> {dest.famousPlaces}
                            </div>
                          </motion.div>
                        )}

                        <button
                          onClick={() => setActiveInfoId(activeInfoId === dest.id ? null : dest.id)}
                          className="w-full py-3 rounded-xl border border-slate-200 bg-white hover:bg-primary/5 hover:border-primary/40 text-sm font-bold text-primary flex items-center justify-center gap-2 transition-all duration-200 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-800/50"
                        >
                          <Info className="w-4 h-4" />
                          <span>{activeInfoId === dest.id ? 'Hide Details' : 'View Sights & Food'}</span>
                        </button>
                      </div>

                    </div>

                  </motion.div>
                ))
              )}
              </div>{/* end inner flex-col gap-5 */}
            </div>{/* end scrollable overflow-y-auto */}

          </div>{/* end right column */}

        </div>{/* end flex-row split panel */}

      </div>
    </section>
  )
}
