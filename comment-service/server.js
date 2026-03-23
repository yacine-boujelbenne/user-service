require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const commentsRoutes = require('./routes/comments');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'Comment Service is running', timestamp: new Date() });
});

app.use('/comments', commentsRoutes);

const PORT = process.env.PORT || 5003;

async function startService() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/socialhub_db', {
            family: 4,
            serverSelectionTimeoutMS: 5000
        });
        console.log('MongoDB connected (Comment Service)');

        app.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════╗
║    Comment Service is running         ║
║      Port: ${PORT}              ║
║      Host: http://127.0.0.1:${PORT}   ║
╚═══════════════════════════════════════╝
      `);
        });
    } catch (err) {
        console.error('Failed to start Comment Service:', err.message);
        process.exit(1);
    }
}

startService();
