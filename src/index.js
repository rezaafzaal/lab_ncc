// src/index.js
// Load environment variables from .env file
const express = require('express');

const app = express();

// Read PORT from environment, default to 3000
const PORT = process.env.PORT || 3000;

// /health endpoint — returns 200 OK with a JSON body
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),        // how long the process has been running
    timestamp: new Date().toISOString()
  });
});

// Optional root endpoint so the app isn't a 404 on /
app.get('/', (req, res) => {
  res.send('Service is running. Try GET /health');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
