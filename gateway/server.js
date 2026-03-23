require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(cors());

app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

app.get('/health', (req, res) => {
    res.json({ status: 'API Gateway is running', timestamp: new Date() });
});

// Proxy configuration
const healthProxyOptions = {
    changeOrigin: true,
    timeout: 5000,
    proxyTimeout: 5000,
    onError: (err, req, res) => {
        console.error(`Health Proxy Error:`, err.message);
        res.status(503).json({ error: 'Service health check failed' });
    }
};

app.get('/health/user', createProxyMiddleware({ ...healthProxyOptions, target: process.env.USER_SERVICE_URL, pathRewrite: { '^/health/user': '/health' } }));
app.get('/health/post', createProxyMiddleware({ ...healthProxyOptions, target: process.env.POST_SERVICE_URL, pathRewrite: { '^/health/post': '/health' } }));
app.get('/health/comment', createProxyMiddleware({ ...healthProxyOptions, target: process.env.COMMENT_SERVICE_URL, pathRewrite: { '^/health/comment': '/health' } }));
app.get('/health/chat', createProxyMiddleware({ ...healthProxyOptions, target: process.env.CHAT_SERVICE_URL, pathRewrite: { '^/health/chat': '/health' } }));

// 1. Proxy to Auth (User Service)
app.use('/api/auth', createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '/auth' },
    onError: (err, req, res) => {
        console.error('[!] Auth Proxy Error:', err.message);
        res.status(503).json({ error: 'Auth Service unavailable' });
    }
}));

// 2. Proxy to User Service
app.use('/api/users', createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/users': '/users' },
    onError: (err, req, res) => {
        console.error('[!] User Service Proxy Error:', err.message);
        res.status(503).json({ error: 'User Service unavailable' });
    }
}));

// 3. Proxy to Post Service
app.use('/api/posts', createProxyMiddleware({
    target: process.env.POST_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/posts': '/posts' },
    onError: (err, req, res) => {
        console.error('[!] Post Service Proxy Error:', err.message);
        res.status(503).json({ error: 'Post Service unavailable' });
    }
}));

// 4. Proxy to Comment Service
app.use('/api/comments', createProxyMiddleware({
    target: process.env.COMMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/comments': '/comments' },
    onError: (err, req, res) => {
        console.error('[!] Comment Service Proxy Error:', err.message);
        res.status(503).json({ error: 'Comment Service unavailable' });
    }
}));

// 5. Proxy to Chat Service
app.use('/api/chat', createProxyMiddleware({
    target: process.env.CHAT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/chat': '/chat' },
    onError: (err, req, res) => {
        console.error('[!] Chat Service Proxy Error:', err.message);
        res.status(503).json({ error: 'Chat Service unavailable' });
    }
}));

app.listen(process.env.PORT || 5000, () => {
    console.log(`
╔═══════════════════════════════════════╗
║      API Gateway is running           ║
║      Port: ${process.env.PORT || 5000}              ║
║      Host: http://127.0.0.1:${process.env.PORT || 5000}  ║
╠═══════════════════════════════════════╣
║  Routes:                              ║
║  → /api/auth     → User Service       ║
║  → /api/users    → User Service       ║
║  → /api/posts    → Post Service       ║
║  → /api/comments → Comment Service    ║
║  → /api/chat     → Chat Service       ║
╚═══════════════════════════════════════╝
  `);
});
