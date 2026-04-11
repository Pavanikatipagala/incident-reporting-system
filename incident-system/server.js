/**
 * Express application entry point.
 * Serves REST API and static frontend files from /public.
 */
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/department', departmentRoutes);

// Frontend (vanilla HTML/CSS/JS) — public files first
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to landing page for non-API GET routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    const e = new Error('Not Found');
    e.statusCode = 404;
    return next(e);
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Central error handler (must be last)
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
