
// Chargement des variables d'environnement (.env)
require('dotenv').config();

// Import des dépendances
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Initialisation de l'application Express
const app = express();

// Middlewares globaux
app.use(cors());
// app.use(express.json()); // ❌ Désactivé car il consomme le flux de données et casse le proxy pour POST/PUT

// Logger middleware pour debugger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'Gateway is running', timestamp: new Date() });
});

// Proxy Santé vers services
const healthProxyOptions = {
  changeOrigin: true,
  timeout: 5000,
  proxyTimeout: 5000,
  onError: (err, req, res) => {
    console.error(`Health Proxy Error:`, err.message);
    res.status(503).json({ error: 'Service health check failed' });
  }
};

app.get('/health/user', createProxyMiddleware({ ...healthProxyOptions, target: process.env.USER_SERVICE_URL, pathRewrite: {'^/health/user': '/health'} }));
app.get('/health/post', createProxyMiddleware({ ...healthProxyOptions, target: process.env.POST_SERVICE_URL, pathRewrite: {'^/health/post': '/health'} }));
app.get('/health/comment', createProxyMiddleware({ ...healthProxyOptions, target: process.env.COMMENT_SERVICE_URL, pathRewrite: {'^/health/comment': '/health'} }));

// ---------------------------------------------------------
// CONFIGURATION DES PROXIES (v3 pattern - fixed)
// ---------------------------------------------------------

// 1. Proxy vers Auth (User Service)
app.use(createProxyMiddleware({
  pathFilter: '/api/auth',
  target: process.env.USER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/auth' },
  onError: (err, req, res) => {
    console.error('[!] Auth Proxy Error:', err.message);
    res.status(503).json({ error: 'Auth Service unavailable' });
  }
}));

// 2. Proxy vers User Service
app.use(createProxyMiddleware({
  pathFilter: '/api/users',
  target: process.env.USER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/users': '/users' },
  onError: (err, req, res) => {
    console.error('[!] User Service Proxy Error:', err.message);
    res.status(503).json({ error: 'User Service unavailable' });
  }
}));

// 3. Proxy vers Post Service
app.use(createProxyMiddleware({
  pathFilter: '/api/posts',
  target: process.env.POST_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/posts': '/posts' },
  onError: (err, req, res) => {
    console.error('[!] Post Service Proxy Error:', err.message);
    res.status(503).json({ error: 'Post Service unavailable' });
  }
}));

// 4. Proxy vers Comment Service
app.use(createProxyMiddleware({
  pathFilter: '/api/comments',
  target: process.env.COMMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/comments': '/comments' },
  onError: (err, req, res) => {
    console.error('[!] Comment Service Proxy Error:', err.message);
    res.status(503).json({ error: 'Comment Service unavailable' });
  }
}));

// 5. Proxy vers Chat Service
app.use(createProxyMiddleware({
  pathFilter: '/api/chat',
  target: process.env.CHAT_SERVICE_URL || 'http://localhost:5003',
  changeOrigin: true,
  pathRewrite: { '^/api/chat': '/' },
  onError: (err, req, res) => {
    console.error('[!] Chat Service Proxy Error:', err.message);
    res.status(503).json({ error: 'Chat Service unavailable' });
  }
}));

// ---------------------------------------------------------
// LANCEMENT DU SERVEUR
// ---------------------------------------------------------
app.listen(process.env.PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║      API Gateway is running           ║
║      Port: ${process.env.PORT}        ║
║      Host: http://127.0.0.1:${process.env.PORT} ║
╠═══════════════════════════════════════╣
║  Routes:                              ║
║  → /api/users    → User Service       ║
║  → /api/posts    → Post Service       ║
║  → /api/comments → Comment Service    ║
╚═══════════════════════════════════════╝
  `);
});
