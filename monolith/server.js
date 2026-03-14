require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');

const authRoutes = require('./modules/auth/routes');
const usersRoutes = require('./modules/users/routes');
const postsRoutes = require('./modules/posts/routes');
const commentsRoutes = require('./modules/comments/routes');
const chatRoutes = require('./modules/chat/routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'Modular Monolith API is running', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 4000;

async function start() {
    try {
        await connectDB();
        console.log('MongoDB connected for modular monolith');

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB error:', err.message);
        });

        app.listen(PORT, () => {
            console.log('');
            console.log('============================================');
            console.log('SocialHub Modular Monolith is running');
            console.log(`API: http://127.0.0.1:${PORT}`);
            console.log('Routes: /api/auth /api/users /api/posts /api/comments /api/chat');
            console.log('============================================');
            console.log('');
        });
    } catch (err) {
        console.error('Failed to start modular monolith:', err.message);
        process.exit(1);
    }
}

start();
