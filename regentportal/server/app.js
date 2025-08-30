const express = require('express');
const app = express();
const connectDB = require('./config/db');
const path = require('path');

// Connect DB
connectDB();

// Middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files from assets directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve built frontend files for preview/testing
app.use(express.static(path.join(__dirname, '../client/dist')));

console.log('✅ Routes loaded');
// Routes

app.use('/api/user', require('./routes/loginRoutes'));

app.use('/api/lookup', require('./routes/lookupRoutes'));

app.use('/api/create', require('./routes/createRoutes'));

app.use('/api/delete', require('./routes/deleteRoutes'));

app.use('/api/books', require('./routes/lookupBooks'))

app.use('/api/tests', require('./routes/getTestContent'));

app.use('/api/test', require('./routes/getTestByID'));

app.use('/api/submit', require('./routes/submitTest'));

app.use('/api/teachers', require('./routes/teacherRoutes'));

app.use('/api/submissions', require('./routes/submissions'));

// Serve React app for all non-API routes (must be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Health check endpoint for Render
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Regent Portal API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use((req, res, next) => {
  console.log(`🔥 Unmatched route hit: ${req.method} ${req.url}`);
  next();
});

module.exports = app;