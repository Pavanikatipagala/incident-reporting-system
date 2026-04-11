# Smart Incident Reporting and Management System

Stack: **Node.js (Express)**, **MongoDB (Mongoose)**, **JWT**, frontend **HTML/CSS/vanilla JS**.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally, or a MongoDB Atlas connection string

## Setup

1. Copy environment variables (optional if `.env` already exists):

   ```bash
   copy .env.example .env
   ```

   Edit `MONGODB_URI` and `JWT_SECRET` as needed.

2. Install dependencies:

   ```bash
   npm install
   ```

3. Seed departments + admin + department users:

   ```bash
   npm run seed
   ```

   Default accounts (example):

   - Admin: `admin@gov.local` / `Admin@123`
   - Road dept: `road@gov.local` / `Dept@123` (and `water@...`, `electric@...`, `sanitation@...`)

4. Start the server:

   ```bash
   npm start
   ```

5. Open **http://localhost:5000** (or your `PORT`).

Citizens register from the **Register** page. Admins and department staff log in with seeded accounts.

## API base URL

All endpoints are under `/api` (same origin when the UI is served by this app).

## Project layout

- `server.js` — Express app entry
- `config/db.js` — Mongo connection
- `models/` — Mongoose schemas
- `middleware/` — JWT auth, uploads, errors
- `controllers/` — Route handlers
- `routes/` — HTTP routes + validation
- `public/` — Static frontend
- `seed.js` — One-time data bootstrap
