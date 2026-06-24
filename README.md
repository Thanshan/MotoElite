# 🏍️ MotoElite — Premium Motorbike Showroom

A full-stack motorbike showroom application with a **Node.js/Express** REST API backend, **MongoDB** database, and a vanilla **HTML/CSS/JavaScript** frontend featuring Three.js 3D visualizations.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on port `27017`
- A static file server (VS Code Live Server, or just use the Express server)

---

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The server starts on **http://localhost:5000**

### 2. Seed the Database

In a new terminal (while the server is running or separately):

```bash
cd backend
npm run seed
```

This creates:
- ✅ Admin user: `admin@motorbike.com` / `admin123`
- ✅ 8 available bikes + 3 coming soon bikes
- ✅ 6 service packages

### 3. Open the Frontend

The Express server serves the frontend automatically.  
Open your browser to: **http://localhost:5000**

Or use VS Code Live Server on the `frontend/` folder directly.

---

## 🗂️ Project Structure

```
project/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bikeController.js
│   │   ├── bookingController.js
│   │   ├── contactController.js
│   │   └── serviceController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT protect + adminOnly
│   │   ├── errorHandler.js
│   │   └── upload.js          # Multer image uploads
│   ├── models/
│   │   ├── Bike.js
│   │   ├── Booking.js
│   │   ├── ContactMessage.js
│   │   ├── Service.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── bikes.js
│   │   ├── bookings.js
│   │   ├── contact.js
│   │   └── services.js
│   ├── uploads/               # Bike images (served as /uploads/*)
│   ├── .env                   # Environment variables
│   ├── .env.example           # Environment template
│   ├── package.json
│   ├── seed.js                # Database seeder
│   └── server.js              # Express app entry point
└── frontend/
    ├── admin/
    │   ├── login.html         # Admin login page
    │   ├── dashboard.html     # Overview + stats
    │   ├── bikes.html         # Bike CRUD management
    │   ├── bookings.html      # Booking management
    │   ├── services.html      # Service management
    │   └── contacts.html      # Contact messages inbox
    ├── css/
    │   ├── style.css          # Global design system
    │   ├── navbar.css
    │   ├── home.css
    │   ├── bikes.css
    │   └── admin.css
    ├── images/
    │   └── bike-placeholder.jpg
    ├── js/
    │   ├── main.js            # Global helpers (API calls, toast, etc.)
    │   ├── admin.js           # Admin auth guard + API helpers
    │   ├── bikes.js           # Bike listing + filters
    │   ├── booking.js         # Booking form logic
    │   └── three-bike.js      # Three.js 3D bike renderer
    ├── index.html             # Home page
    ├── bikes.html             # Available bikes
    ├── bike-detail.html       # Single bike detail + specs
    ├── booking.html           # Test ride booking form
    ├── services.html          # Service packages
    ├── coming-soon.html       # Upcoming bikes with countdown
    ├── contact.html           # Contact form
    └── about.html             # About page
```

---

## 🔌 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/bikes` | List bikes (search, filter, paginate) |
| `GET` | `/api/bikes/:id` | Single bike + related bikes |
| `GET` | `/api/bikes/brands` | Distinct brand list |
| `GET` | `/api/services` | Active service packages |
| `POST` | `/api/bookings` | Submit test ride booking |
| `POST` | `/api/contact` | Submit contact enquiry |
| `POST` | `/api/auth/login` | Admin login → returns JWT |

### Protected Admin Endpoints (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/auth/profile` | Current user profile |
| `GET` | `/api/auth/users` | All users |
| `POST` | `/api/bikes` | Add new bike |
| `PUT` | `/api/bikes/:id` | Update bike |
| `DELETE` | `/api/bikes/:id` | Delete bike |
| `GET` | `/api/bookings` | All bookings |
| `GET` | `/api/bookings/stats` | Booking statistics |
| `PUT` | `/api/bookings/:id/status` | Update booking status |
| `DELETE` | `/api/bookings/:id` | Delete booking |
| `POST` | `/api/services` | Create service |
| `PUT` | `/api/services/:id` | Update service |
| `DELETE` | `/api/services/:id` | Delete service |
| `GET` | `/api/contact` | All contact messages |
| `PUT` | `/api/contact/:id/read` | Mark message as read |
| `PUT` | `/api/contact/:id/replied` | Mark as replied |
| `DELETE` | `/api/contact/:id` | Delete message |

---

## 🔐 Authentication

JWT tokens are stored in `localStorage`:
- **Key:** `adminToken` — Bearer token for API requests
- **Key:** `adminUser` — JSON object with `{ id, name, email, role }`

The admin portal at `/admin/login.html` automatically redirects to `dashboard.html` after successful login.  
All admin pages use `requireAuth()` to guard against unauthorized access.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp backend/.env.example backend/.env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Express server port |
| `MONGODB_URI` | `mongodb://localhost:27017/motorbike_showroom` | MongoDB connection string |
| `JWT_SECRET` | *(required)* | Secret key for signing JWT tokens |
| `JWT_EXPIRE` | `7d` | JWT expiry duration |
| `NODE_ENV` | `development` | Environment mode |

---

## 🌱 Default Credentials (After Seeding)

| Field | Value |
|-------|-------|
| **URL** | http://localhost:5000/admin/login.html |
| **Email** | `admin@motorbike.com` |
| **Password** | `admin123` |

> ⚠️ Change the password after first login in production!

---

## 🛠️ Scripts

```bash
# Install dependencies
cd backend && npm install

# Start with nodemon (auto-restart)
npm run dev

# Start production
npm start

# Seed database
npm run seed
```

---

## 📦 Tech Stack

**Backend**
- Node.js + Express 4
- MongoDB + Mongoose 8
- JWT (jsonwebtoken) — authentication
- bcryptjs — password hashing
- multer — image uploads
- express-validator — request validation
- morgan — HTTP request logging

**Frontend**
- Vanilla HTML5 / CSS3 / JavaScript (ES2022+)
- Three.js r128 — 3D bike visualization
- CSS custom properties design system
- Intersection Observer API — scroll animations

---

## 🚦 Status After Setup

```
SERVER:      RUNNING   ✅  http://localhost:5000
API:         CONNECTED ✅  http://localhost:5000/api/health
BOOKING:     WORKING   ✅  POST /api/bookings
ADMIN LOGIN: WORKING   ✅  POST /api/auth/login
PROJECT:     READY TO TEST ✅
```
