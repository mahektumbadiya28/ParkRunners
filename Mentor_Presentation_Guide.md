# VolenPark - Project Architecture & Technical Guide
*A comprehensive technical overview designed for mentor evaluation and project presentation.*

## 1. Project Overview
**VolenPark** is a comprehensive, AI-driven Smart Parking Management System. It connects people who need parking (Car Owners) with people who have empty spots (Space Providers), while incorporating Valets for seamless car drop-offs and pick-ups. The system leverages real-time sockets for live tracking and a dedicated AI microservice for dynamic pricing.

---

## 2. Technology Stack
The project uses a modern microservices-oriented architecture:

### Frontend (Client-Side)
- **Framework**: React.js (built with Vite for fast HMR and optimized builds)
- **Styling**: Tailwind CSS (utility-first) + Vanilla CSS for custom premium glassmorphism themes (`glass-panel`).
- **Animations**: Framer Motion (for smooth page transitions and micro-interactions).
- **Maps**: React-Leaflet (interactive map for finding parking spots).
- **Real-Time**: Socket.io-client (listening for live updates).

### Backend (Core API)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (managed via Mongoose ORM).
- **Authentication**: JSON Web Tokens (JWT) & bcrypt for password hashing.
- **Real-Time Engine**: Socket.io (for emitting state changes instantly across dashboards).

### AI Microservice
- **Framework**: Python + Django (REST API).
- **Machine Learning**: Scikit-Learn / TensorFlow.
- **Purpose**: Calculates dynamic pricing multipliers (surge pricing) based on expected demand using Regression and Random Forest models.

---

## 3. How to Use: Different Points of View (PoVs)

VolenPark implements robust Role-Based Access Control (RBAC). Here is how the application flows for each user type:

### 🚘 Car Owner (The Consumer)
- **Goal**: Find and book a parking spot easily.
- **Flow**: 
  1. Opens the **Interactive Map** to see available spots nearby.
  2. Selects a spot, inputs vehicle details, and initiates a booking.
  3. Uses **Live Tracking** to see the status of their car (Pending -> Active -> Parked -> Completed).
  4. Processes payment and leaves a review.

### 🏢 Space Provider (The Host)
- **Goal**: Monetize empty parking spaces.
- **Flow**:
  1. Lists a new parking space (with pricing, location, and total slots).
  2. Dashboard provides a comprehensive **AI Business Hub** showing expected weekly revenue and dynamically suggested price multipliers.
  3. Receives live notifications when a user books their spot (via Socket.io).

### 🏃 Valet (The Operator)
- **Goal**: Manage physical car drop-offs and parking.
- **Flow**:
  1. Accesses the **Job Board** (Live feed of incoming bookings).
  2. Accepts a job, updating the system status from `Pending` to `Active`.
  3. Moves the car, marks it as `Parked`, and eventually `Completed`.

### 🛡️ Admin (The Overseer)
- **Goal**: Platform moderation.
- **Flow**: Has a high-level view of all active bookings, total platform revenue, and the ability to ban users or remove fraudulent parking spots.

---

## 4. How Features Were Built (Technical Flow)

If your mentor asks, *"How did you actually implement X?"*, use these explanations:

### A. Authentication & Role Management
- **How it works**: When a user registers or logs in, the Node backend validates credentials using `bcrypt` and generates a `JWT`.
- **Technical Correctness**: The JWT is passed to the frontend and stored securely. Every backend API route is protected by an `authMiddleware.js` which verifies the token signature and attaches `req.user`. A separate middleware (`roleMiddleware`) ensures that a Valet cannot access Provider routes.

### B. Real-Time Booking Tracking (Socket.io)
- **How it works**: Instead of the frontend constantly pinging the server ("Is my car parked yet?"), the server pushes updates to the frontend.
- **Technical Correctness**: 
  1. When a Valet clicks "Accept Job", it triggers an Express route (`PUT /api/bookings/:id/action`).
  2. The controller updates the MongoDB document (`findOneAndUpdate` with `returnDocument: 'after'`).
  3. Immediately after saving, the backend executes: `req.app.get('io').emit('booking_update', { bookingId, status })`.
  4. The Owner and Provider dashboards (using the `useSocket` React hook) hear this event and automatically trigger a fast re-fetch of the data, instantly updating the UI without a page reload.

### C. AI Dynamic Pricing (Microservice Architecture)
- **How it works**: The Node backend doesn't do heavy ML math. It delegates it.
- **Technical Correctness**: We decoupled the AI logic into a separate Python Django service (`ai-service`). The Node.js backend makes internal HTTP requests to the Django API, passing current platform metrics (available spots, time of day). Django runs this through a trained Random Forest model and returns a `suggestedPricingMultiplier` (e.g., 1.2x surge). Node.js then serves this to the Provider Dashboard.

### D. Interactive Maps & Geo-Spatial Data
- **How it works**: Car owners see physical pins on a map.
- **Technical Correctness**: Uses `Leaflet.js`. When the map mounts, React fetches `/api/parking/available`. The backend filters MongoDB for active spaces with `availableSlots > 0`. The frontend maps over this array, rendering `<Marker>` components at the exact `[latitude, longitude]` coordinates provided by the database.

---

## 5. Potential Mentor Questions & How to Answer Them

**Q: Why did you use two different backends (Node & Python)?**
*Answer:* "Separation of concerns. Node.js (Express) is extremely fast and scalable for handling thousands of simultaneous I/O operations like HTTP requests and real-time Socket.io connections. However, Python has a much richer ecosystem for Machine Learning (TensorFlow, scikit-learn). By making them microservices, Node handles the web traffic, and Python handles the heavy AI computation."

**Q: How do you prevent users from double-booking a spot?**
*Answer:* "Concurrency control. In our `bookingController`, we specifically query for spots where `availableSlots > 0` and instantly decrement it (`$inc: { availableSlots: -1 }`) atomically within the MongoDB database using `findOneAndUpdate`. This prevents race conditions."

**Q: How does the UI handle Light/Dark mode?**
*Answer:* "We used CSS variables heavily. Instead of hardcoding colors, we use classes like `glass-panel` bound to CSS variables (`var(--glass-bg)`). When the user toggles the theme, a `.dark` class is appended to the root HTML, swapping out the variable palettes instantly without needing React re-renders."
