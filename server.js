// Production server for RoadPro
// This server handles both frontend and API requests
// For deployment to dharmadkunwar.com.np

const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Import API routes (these would come from the api directory when deployed)
// For now, we'll set up proxy to handle API requests
const { createProxyMiddleware } = require('http-proxy-middleware');

// Proxy API requests to the backend API server
app.use('/api', createProxyMiddleware({
  target: process.env.API_SERVER_URL || 'http://localhost:3001', // API server location
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api', // remove /api prefix when forwarding
  },
}));

// Serve frontend files for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`RoadPro server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to access the application`);
  console.log(`API endpoints will be proxied to: ${process.env.API_SERVER_URL || 'http://localhost:3001'}`);
});