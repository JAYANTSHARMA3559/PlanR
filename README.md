# PlanR — Task Management System

A full-stack task management app with analytics dashboard, built with **React**, **Node.js + Express**, and **MongoDB**.

> **Live Demo**: _Add your deployed link here after hosting_

---

## Features

- 🔐 JWT Authentication (Signup / Login)
- ✅ Full Task CRUD — Create, Read, Update, Delete
- 🏷️ Status: `Todo` / `In Progress` / `Done`
- 🔥 Priority: `Low` / `Medium` / `High`
- 🔍 Search, filter by status & priority, sort by created/due date/priority
- 📖 Pagination (10 tasks per page)
- 📊 Analytics dashboard — stats cards + Donut & Bar charts
- 🌙 Dark / Light mode (persisted)
- 📱 Fully responsive design
- ✨ Glassmorphism UI with Lucide SVG icons

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Recharts, Lucide React |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Styling | Vanilla CSS with CSS Custom Properties |

---

## Project Structure

```
Assignment_SmartInterview/
├── backend/          # Node.js + Express REST API
│   └── src/
│       ├── config/        # DB connection
│       ├── controllers/   # Business logic
│       ├── middleware/     # Auth + error handler
│       ├── models/         # Mongoose schemas
│       └── routes/         # API routes
└── frontend/         # React (Vite) SPA
    └── src/
        ├── components/     # Sidebar, TaskModal
        ├── context/        # AuthContext, ToastContext
        ├── pages/          # Login, Signup, Dashboard, Tasks
        └── utils/          # Axios instance, helpers
```

---

## Setup

### Prerequisites
- **Node.js** >= 18
- **MongoDB** running locally on port 27017 (or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/Assignment_SmartInterview.git
cd Assignment_SmartInterview
```

### 2. Backend

```bash
cd backend
cp .env.example .env      # Edit MONGO_URI and JWT_SECRET
npm install
npm run dev               # Runs on http://localhost:5000
```

**Environment variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/planr` |
| `JWT_SECRET` | Secret key for JWT signing | *(required)* |
| `JWT_EXPIRES_IN` | Token expiry duration | `7d` |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_URL` | Deployed frontend URL (for CORS) | — |

### 3. Frontend

```bash
cd frontend
npm install
npm run dev               # Runs on http://localhost:5173
```

For production builds, set the API URL:

```bash
VITE_API_URL=https://your-backend.onrender.com/api npm run build
```

---

## API Endpoints

All task routes require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET` | `/api/auth/me` | Get current user |
| `GET` | `/api/tasks` | List tasks (filter, search, sort, paginate) |
| `POST` | `/api/tasks` | Create a task |
| `PUT` | `/api/tasks/:id` | Update a task |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `GET` | `/api/tasks/analytics` | Get stats & insights |

### GET /api/tasks — Query Parameters

| Param | Values | Description |
|-------|--------|-------------|
| `status` | `todo` / `in-progress` / `done` | Filter by status |
| `priority` | `low` / `medium` / `high` | Filter by priority |
| `search` | string | Search task title |
| `sortBy` | `createdAt` / `dueDate` / `priority` | Sort field |
| `order` | `asc` / `desc` | Sort direction |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (max 50) |

---

## Design Decisions

### Backend
- Auth uses **JWT in the `Authorization` header**. Stateless, simple. No cookie/session headaches.
- I added **compound indexes** on `(user, status)`, `(user, priority)`, and `(user, dueDate)` so that filtered queries stay fast even with thousands of tasks per user.
- There's a **global error middleware** that catches Mongoose-specific errors (duplicate key, validation, bad ObjectId) and maps them to proper HTTP status codes. This keeps the controllers clean — they just `next(err)` and move on.
- All config lives in `.env`. The `.env.example` file is included so anyone cloning the repo knows what to set up.
- The `protect` middleware verifies the JWT and attaches `req.user`, so every route handler downstream can just use it directly.
- CORS is configured to accept `FRONTEND_URL` from the environment, which makes deployment straightforward.

### Frontend
- **Vite + React 18** for fast dev reloads and small production bundles.
- The UI uses `backdrop-filter: blur()` on cards and sidebars for a frosted glass look. I went with **Lucide React** for icons since they're tree-shakeable and look way cleaner than emojis.
- Typography is **Outfit** for headings and **Inter** for body text — both from Google Fonts.
- Theme switching (dark/light) is done entirely via **CSS custom properties** and a `data-theme` attribute on `<html>`. No JS re-renders needed.
- Charts use **Recharts** — it's lightweight and composable, works well for the donut + bar charts on the dashboard.
- Search input has a **350ms debounce** so it doesn't fire an API call on every keystroke.
- Marking a task as done uses **optimistic UI** — the local state updates instantly, no spinner or refetch needed.
- **Axios interceptors** handle two things: injecting the auth token into every request, and catching 401s globally to redirect to login.
- Auth state and theme preference are stored in **localStorage** so they survive page refreshes.

---

## Deployment

### Backend → Render (Free)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo, set:
   - **Root directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV=production`, `FRONTEND_URL`
5. Deploy — note the URL (e.g. `https://planr-api.onrender.com`)

### Database → MongoDB Atlas (Free)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → Create free M0 cluster
2. Create a database user and whitelist `0.0.0.0/0`
3. Copy the connection string and set it as `MONGO_URI` in Render

### Frontend → Vercel (Free)

1. Go to [vercel.com](https://vercel.com) → **Import Project** from GitHub
2. Set **Root directory** to `frontend`
3. Add environment variable: `VITE_API_URL` = `https://your-backend.onrender.com/api`
4. Deploy — note the URL and update the **Live Demo** link above

---

## Local Development Notes

- Vite dev server proxies `/api/*` → `http://localhost:5000` (configured in `vite.config.js`), so no CORS issues during local development
- Default MongoDB DB name is `planr` (configurable via `MONGO_URI` in `.env`)
