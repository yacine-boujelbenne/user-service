require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth/auth');
const usersRoutes = require('./routes/users');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'User Service is running', timestamp: new Date() });
});

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);

const PORT = process.env.PORT || 5001;

async function startService() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/socialhub_db', {
      family: 4,
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected (User Service)');

    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════╗
║      User Service is running          ║
║      Port: ${PORT}              ║
║      Host: http://127.0.0.1:${PORT}   ║
╚═══════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('Failed to start User Service:', err.message);
    process.exit(1);
  }
}

startService();
