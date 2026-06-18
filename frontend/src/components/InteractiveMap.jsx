import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Star, Sparkles, AlertCircle, ArrowRight, Utensils, CloudSun } from 'lucide-react'
import India from '@svg-maps/india'
import { indianTravelData } from '../lib/indianTravelData'

// Define detailed state travel metadata for map selections
const stateData = {
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

export default function InteractiveMap() {
  const [selectedState, setSelectedState] = useState("Goa")
  const [hoveredState, setHoveredState] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleStateClick = (stateName) => {
    setSelectedState(stateName)
  }

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  const triggerPlanner = () => {
    const plannerSection = document.getElementById('ai-planner')
    if (plannerSection) {
      plannerSection.scrollIntoView({ behavior: 'smooth' })
      // Dispatch custom event to notify AITravelPlanner of state change
      window.dispatchEvent(new CustomEvent('set-planner-state', { detail: { state: selectedState } }))
      // Auto populate state input if possible by dispatching window event or element focus
      setTimeout(() => {
        const stateSelect = document.getElementById('state-selector-input')
        if (stateSelect) {
          stateSelect.value = selectedState
          stateSelect.dispatchEvent(new Event('change', { bubbles: true }))
        }
      }, 300)
    }
  }

  const currentStateData = stateData[selectedState] || {
    sights: ["Coming Soon!", "We are currently mapping active spots here."],
    food: "Local culinary reviews under development",
    rating: 4.5,
    category: "New Region",
    weather: "Varies by seasonal conditions",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400",
    desc: `We are currently mapping out popular destinations, culinary spots, and heritage sights in ${selectedState}. Click a glowing travel hub like Rajasthan, Goa, or Kerala to try our active AI travel wizard!`
  };

  const selectedStateObj = indianTravelData.find(st => st.state.toLowerCase() === selectedState.toLowerCase());
  const statePlaces = selectedStateObj ? selectedStateObj.places : [];

  return (
    <section id="explore" className="py-24 bg-white dark:bg-[#06020E] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900 dark:text-white">
            Search by <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Interactive Map</span>
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-350 font-medium">
            Click on a glowing travel region on the map to explore famous attractions, local cuisine, and get instant AI-powered suggestions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Map Vector Panel */}
          <div 
            className="lg:col-span-7 flex justify-center relative select-none"
            onMouseMove={handleMouseMove}
          >
            
            {/* Compass overlay behind map */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.02]">
              <div className="w-[400px] h-[400px] rounded-full border-4 border-dashed border-primary animate-spin-slow"></div>
            </div>

            {/* Map wrapper using `@svg-maps/india` vector coordinates */}
            <div className="clay-card p-4 md:p-6 bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 shadow-inner flex items-center justify-center w-full max-w-[480px] mx-auto relative aspect-square rounded-2xl">
              
              {/* Native Vector Map of India */}
              <svg 
                viewBox={India.viewBox} 
                className="w-full h-full z-10 transition-all select-none drop-shadow-2xl"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* State Vector Paths */}
                <g className="india-map-grid">
                  {India.locations.map((loc) => {
                    const dbStateName = ID_STATE_MAP[loc.id] || loc.name;
                    const isExplorable = ID_STATE_MAP[loc.id] !== undefined;
                    const isSelected = selectedState === dbStateName;
                    const isHovered = hoveredState === dbStateName;

                    // Compute dynamic glassmorphic class name for all states
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
                          setSelectedState(dbState);
                        }}
                        onMouseEnter={() => {
                          setHoveredState(dbStateName);
                        }}
                        onMouseLeave={() => setHoveredState(null)}
                      />
                    );
                  })}
                </g>
              </svg>

              {/* FLOATING CURSOR TOOLTIP (Blended Glassmorphism + Maximum z-index visibility overlay) */}
              <AnimatePresence>
                {hoveredState && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute bg-slate-950/90 text-white font-extrabold text-[11px] px-3.5 py-2 rounded-xl border border-slate-700/80 shadow-2xl pointer-events-none z-[99999] tracking-wide flex items-center gap-2 backdrop-blur-md transition-all duration-75"
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

          {/* Details Claymorphism Panel */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              {selectedState && (
                <motion.div
                  key={selectedState}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="clay-card p-6 md:p-8 bg-white/80 dark:bg-slate-900/60"
                >
                  {/* Image Header */}
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-6 shadow-inner">
                    <img 
                      src={currentStateData.image} 
                      alt={selectedState} 
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-bold uppercase tracking-wide">
                        {currentStateData.category}
                      </span>
                      <div className="flex items-center gap-1 bg-white/90 px-2 py-1 rounded-lg text-slate-800 text-xs font-extrabold shadow-sm">
                        <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                        <span>{currentStateData.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <div className="text-left">
                    <h3 className="text-2xl font-display font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span>{selectedState} Exploration</span>
                    </h3>
                    <p className="mt-3 text-sm text-slate-655 dark:text-slate-300 leading-relaxed font-medium">
                      {currentStateData.desc}
                    </p>

                    <hr className="my-5 border-slate-200/60 dark:border-slate-800/40" />

                    {/* Sights list */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                          <span>Must Visit Attractions ({statePlaces.length})</span>
                        </h4>
                        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                          {statePlaces.length === 0 ? (
                            <div className="py-8 text-center text-xs text-slate-400">
                              Attractions list under development
                            </div>
                          ) : (
                            statePlaces.map((place) => (
                              <div key={place.name} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-slate-800/40 items-center transition-all duration-200 hover:scale-[1.01] hover:bg-slate-100/50 dark:hover:bg-white/[0.05]">
                                <img src={place.image} alt={place.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                                <div className="text-left min-w-0 flex-1">
                                  <div className="flex justify-between items-start gap-1">
                                    <h4 className="font-extrabold text-xs text-slate-800 dark:text-white truncate">{place.name}</h4>
                                    <span className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-300 text-[8px] font-bold uppercase tracking-wide flex-shrink-0">{place.type}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 dark:text-white/40 mt-1 line-clamp-2 leading-relaxed">{place.info}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Food & Weather row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        
                        {/* Food */}
                        <div className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-100/60 dark:bg-amber-950/5 dark:border-amber-900/10 flex items-start gap-2.5">
                          <Utensils className="w-4 h-4 text-amber-500 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-bold text-amber-600/70 dark:text-amber-400 uppercase tracking-wide">Local Food</p>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 leading-snug">{currentStateData.food}</p>
                          </div>
                        </div>

                        {/* Weather */}
                        <div className="p-3.5 rounded-2xl bg-sky-50/40 border border-sky-100/60 dark:bg-sky-950/5 dark:border-sky-900/10 flex items-start gap-2.5">
                          <CloudSun className="w-4 h-4 text-sky-500 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-bold text-sky-650/70 dark:text-sky-400 uppercase tracking-wide">Weather Info</p>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 leading-snug">{currentStateData.weather}</p>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* CTA to auto launch AI Trip Wizard */}
                    <button
                      onClick={triggerPlanner}
                      className="clay-btn-primary w-full py-3.5 text-sm mt-8 flex items-center justify-center gap-2"
                    >
                      <span>Create AI Itinerary for {selectedState}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  )
}
