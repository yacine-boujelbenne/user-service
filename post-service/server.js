require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const postsRoutes = require('./routes/posts');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'Post Service is running', timestamp: new Date() });
});

app.use('/posts', postsRoutes);

const PORT = process.env.PORT || 5002;

async function startService() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/socialhub_db', {
      family: 4,
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected (Post Service)');

    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════╗
║      Post Service is running          ║
║      Port: ${PORT}              ║
║      Host: http://127.0.0.1:${PORT}   ║
╚═══════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('Failed to start Post Service:', err.message);
    process.exit(1);
  }
}

startService();
