const express = require('express');
const app = express();
const connectDB = require('./config/db');

// Connect DB
connectDB();

// Middleware
app.use(express.json());

console.log('✅ Routes loaded');
// Routes
app.use('/api/tests', require('./routes/testRoutes'));
// Add more routes as needed

app.get('/', (req, res) => {
  res.send('Root route works!');
});

module.exports = app;