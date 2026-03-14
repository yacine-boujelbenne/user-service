const express = require('express');
const Message = require('./model');

const router = express.Router();

router.get('/:userId1/:userId2', async (req, res) => {
    try {
        const { userId1, userId2 } = req.params;
        const messages = await Message.find({
            $or: [
                { senderId: userId1, receiverId: userId2 },
                { senderId: userId2, receiverId: userId1 },
            ],
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { senderId, receiverId, text } = req.body;
        if (!senderId || !receiverId || !text) {
            return res.status(400).json({ error: 'senderId, receiverId, and text are required' });
        }

        const message = new Message({ senderId, receiverId, text });
        await message.save();
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message', details: error.message });
    }
});

module.exports = router;
