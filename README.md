# Indian Travel AI — Full-Stack Travel Planner Website

Welcome to **Indian Travel AI**, a production-ready, premium, full-stack AI-powered travel planner specifically customized for exploring India. It leverages a futuristic **Claymorphic** and **Glassmorphic** visual aesthetic with fluid micro-animations, double inner shadows, neon purple glowing backdrops, and seamless responsive scaling.

---

## 🌟 Key Application Features

1. **AITravelPlanner chatbot wizard**: A step-by-step questionnaire (State -> Theme -> Budget -> Duration) that queries our custom backend AI heuristical engine to return hyper-detailed day-by-day itineraries, suggested hotels, native meal plans, packing lists, and transport optimization tips.
2. **Interactive SVG India Map**: A beautifully drawn interactive SVG vector map highlighting key tourism states (Goa, Kerala, Ladakh, Rajasthan, Varanasi, Hampi, Ooty) with neon outlines, hover expansions, and detailed slide-out drawers.
3. **Advanced Dropdown Search & Grid**: Instantly search locations by State, Category, Budget, and Duration filters with auto-suggestions, collapsible sight guides, and bookmarking toggles.
4. **Interactive E2E Customer Reviews Feed**: Public reviews feed where users can submit active ratings, locations, and comments that persist in the database in real-time.
5. **E2E JWT Secured Accounts**: Signup and Login gateways using password BCrypt hashing, numeric 6-digit verification OTP emails, short password recovery keys, and username recovery emails printed dynamically to your Spring Boot console log.
6. **User Profile & Recharts analytics Dashboard**: A private workspace for logged-in users to manage profiles, view bookmarked destinations, retrieve generated AI travel tracks, and explore interactive Recharts charts mapping cost allocations, durations, and budget levels.

---

## 🛠️ Technology Stack

### Frontend SPA (`/frontend`)
* **Core**: React.js 18, Vite compile engine, Tailwind CSS utility styling
* **State Management**: Zustand
* **Animations**: Framer Motion
* **Visual Statistics**: Recharts
* **API Client**: Axios (configured with auto-bearer token interceptors)
* **Icons & Decor**: Lucide React Icons, Canvas-Confetti celebrations

### Secure Backend API (`/backend`)
* **Framework**: Spring Boot 3.2.5 (Java 17)
* **Security & Tokens**: Spring Security 6, io.jsonwebtoken (Stateless Bearer JWT filters)
* **Data Access**: Spring Data JPA, Hibernate ORM
* **Database**: In-Memory H2 Database (with programmatic `DataSeeder` runner for failproof local startups)

---

## 🚀 Local Deployment Guide

Follow these steps to launch the entire full-stack application on your system.

### Prerequisites
* **Java**: OpenJDK 17 or higher
* **Node.js**: Node 18 or higher (with `npm`)
* **Maven**: Apache Maven 3.x

---

### Step 1: Start the Spring Boot Backend

1. Navigate to the backend directory:
   ```bash
   cd x:\project1\backend
   ```
2. Run the application using Maven:
   ```bash
   mvn spring-boot:run
   ```
3. The server starts successfully on port **`8080`**.
4. **Database Debugger Console**: You can view the live H2 database console in your browser at `http://localhost:8080/h2-console`.
   * **JDBC URL**: `jdbc:h2:mem:indiantraveldb`
   * **Username**: `sa`
   * **Password**: `password`

---

### Step 2: Start the React + Vite Frontend

1. Navigate to the frontend directory:
   ```bash
   cd x:\project1\frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the local host address: **`http://localhost:5173`**.

---

## 🔑 Pre-Seeded Accounts for Testing

Our programmatic seeder (`DataSeeder.java`) automatically populates the database on startup so you can test the application E2E out of the box without manual registration!

### 1. Test User Account (Fully Verified)
* **Username**: `testuser`
* **Password**: `password123`
* Use this to immediately log in, bookmark spots, and generate AI trips saved directly to your dashboard!

### 2. Admin User Account
* **Username**: `admin`
* **Password**: `admin123`

---

## 📬 Simulated Email Consoles (OTP/Reset Tokens)

Because this is a local development environment, Spring Security email outputs are routed directly to your **Spring Boot backend terminal logs** for ease of testing!
* **OTP Verification**: When registering a new account, the 6-digit numeric OTP is printed inside the backend console. Simply copy it, paste it into the frontend verify screen, and activate your account!
* **Forgot Password**: The 8-character uuid token for password resets will be printed inside the terminal logs.
* **Forgot Username**: The recovered username will also print inside the terminal logs.
