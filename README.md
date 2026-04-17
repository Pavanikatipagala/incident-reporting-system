 Smart Incident Reporting and Management System
A full-stack web application to report and manage public infrastructure issues like road damage, water leakage, electricity faults, and waste/sanitation problems.
Built with **Node.js + Express**, **MongoDB**, **JWT Authentication**, and **Vanilla HTML/CSS/JavaScript**.
---
## Features
### 1) Citizen Module
- Register and login
- Submit complaints with:
  - Title
  - Description
  - Category (`roads`, `water`, `electricity`, `waste`)
  - Location
  - Optional image
- View own complaints
- Track complaint status:
  - `pending`
  - `assigned`
  - `in_progress`
  - `resolved`
- Edit own complaint (until resolved)
- Delete own complaint (only when pending)
### 2) Admin Module
- Admin login
- View all complaints
- Assign complaint to department:
  - Road Department
  - Water Department
  - Electricity Department
  - Sanitation Department
- Update complaint status
- Delete complaints
- Dashboard metrics:
  - Total complaints
  - Pending
  - Assigned
  - In Progress
  - Resolved
### 3) Department Module
- Department login (Road/Water/Electricity/Sanitation)
- View assigned complaints
- Update status (`in_progress`, `resolved`)
- Add resolution notes
- View resolved complaint history
---
## Tech Stack
- **Frontend:** HTML, CSS, Vanilla JavaScript (Fetch API)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JWT (JSON Web Token)
- **File Uploads:** Multer

Setup & Run
Clone / open project directory
Create environment file:
copy .env.example .env
Update .env values:
MONGODB_URI
JWT_SECRET
Install dependencies:
npm install
Seed initial data:
npm run seed
Start server:

npm start

Default Seeded Accounts
Admin

Email: admin@gov.local
Password: Admin@123
Department Users

road@gov.local / Dept@123
water@gov.local / Dept@123
electric@gov.local / Dept@123
sanitation@gov.local / Dept@123
Citizens can register directly from the Register page.

uthentication
JWT token is generated on login/register
Token is sent in headers:
Authorization: Bearer <token>
Protected routes use:
authentication middleware
role-based authorization middleware (citizen, admin, department)
Frontend stores JWT in localStorage

Notes
Frontend and backend are served from the same Express app.
Static frontend files are in public/.
Uploaded complaint images are served from /uploads.
Includes request validation and centralized error handling.
