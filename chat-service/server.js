// Chat Service - microservice
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/chat_db')
  .then(() => console.log('✅ MongoDB Chat connected'))
  .catch((err) => console.error('❌ MongoDB Chat error:', err.message));

// Définition du schéma Message
const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// =========================
// GET /:userId1/:userId2 → récupérer les messages entre deux utilisateurs
// =========================
app.get('/:userId1/:userId2', async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 }
      ]
    }).sort({ createdAt: 1 }); // Ordre chronologique
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
  }
});

// =========================
// POST / → envoyer un message
// =========================
app.post('/', async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;
    if (!senderId || !receiverId || !text) {
      return res.status(400).json({ error: 'senderId, receiverId, and text are required' });
    }

    const message = new Message({ senderId, receiverId, text });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  }
});

const PORT = 5003;
app.listen(PORT, () => {
  console.log(`Chat Service running on port ${PORT}`);
});
