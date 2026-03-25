# Taskify — Task Management System

A full-stack task management app with analytics dashboard, built with **React**, **Node.js + Express**, and **MongoDB**.

> **Live Demo**: [https://taskify-app.vercel.app](https://taskify-app.vercel.app)  
> *(Update this link after deployment)*

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
- ✨ Premium glassmorphism UI with Lucide SVG icons

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
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/taskify` |
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
- **JWT in Authorization header** — stateless auth, no cookie complexities
- **Compound MongoDB indexes** on `(user, status)`, `(user, priority)`, `(user, dueDate)` — ensures per-user queries scale with large datasets
- **Global error middleware** — unified error responses; Mongoose errors (duplicate key, cast, validation) all handled centrally
- **`.env` config** — no secrets hardcoded; `.env.example` provided for easy onboarding
- **`protect` middleware** — extracts + verifies JWT, attaches user to `req.user` for all downstream controllers
- **Environment-aware CORS** — `FRONTEND_URL` env var allows deployed frontend URL to be whitelisted

### Frontend
- **Vite + React 18** — fast HMR for development, optimized production builds
- **Glassmorphism UI** — frosted glass cards with `backdrop-filter: blur()` for a modern, premium aesthetic
- **Lucide React icons** — tree-shakeable SVG icons replace emojis for a professional, crisp look
- **Outfit + Inter fonts** — display font for headings, Inter for body text
- **Micro-animations** — staggered card entrances, shimmer progress bars, spring-physics hover effects
- **CSS Custom Properties** — dark/light theme switch with zero JS, just a `data-theme` attribute on `<html>`
- **Recharts** — donut (status) and bar (priority) charts in analytics dashboard
- **Debounced search** — 350ms debounce on search input avoids API spam
- **Optimistic UI for toggle-done** — immediate local state update for snappy UX
- **Axios interceptors** — token injection + global 401 handler (auto-redirect to login)
- **Context + localStorage** — auth state and theme preference persist across refreshes

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
5. Deploy — note the URL (e.g. `https://taskify-api.onrender.com`)

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
- Default MongoDB DB name is `taskify` (configurable via `MONGO_URI` in `.env`)
