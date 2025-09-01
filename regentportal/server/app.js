const express = require('express');
const app = express();
const connectDB = require('./config/db');
const path = require('path');

// Connect DB
connectDB();

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url} - Origin: ${req.headers.origin || 'No origin'}`);
  next();
});

// Enhanced CORS middleware
app.use((req, res, next) => {
  // Allow requests from any origin in development, or specific origins in production
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:8082',
    'https://p01--regegentportalapi--9lbdlr4dyhwr.code.run',
    'https://frontend--regentportal--9lbdlr4dyhwr.code.run',
    'https://regentportal-frontend.onrender.com'
  ];
  
  const origin = req.headers.origin;
  console.log(`🌐 CORS check - Origin: ${origin}, Allowed: ${allowedOrigins.includes(origin)}`);
  
  if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth-token');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Preflight request handled');
    res.status(200).end();
    return;
  }
  
  next();
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

// Backend only - no frontend serving needed

// Health check endpoint for Render
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Regent Portal API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root health check for Northflank
app.get('/', (req, res) => {
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