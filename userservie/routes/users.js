const express = require('express');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user', details: error.message });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ status: 'deleted', user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user', details: error.message });
    }
});

module.exports = router;
