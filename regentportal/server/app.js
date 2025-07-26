const express = require('express');
const app = express();
const connectDB = require('./config/db');




// Connect DB
connectDB();

// Middleware
app.use(express.json());

console.log('✅ Routes loaded');
// Routes

app.use('/api/user', require('./routes/loginRoutes'));

app.use('/api/lookup', require('./routes/lookupRoutes'));

app.use('/api/create', require('./routes/createRoutes'));

app.use('/api/delete', require('./routes/deleteRoutes'));

app.use('/api/books', require('./routes/lookupBooks'))

app.get('/', (req, res) => {
  res.send('Root route works!');
});

app.use((req, res, next) => {
  console.log(`🔥 Unmatched route hit: ${req.method} ${req.url}`);
  next();
});

module.exports = app;