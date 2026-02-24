
// Import d'Express et création du routeur
const express = require('express');
const router = express.Router();

// Import du modèle User
const User = require('../models/User');

// =========================
// GET /users → récupérer tous les utilisateurs
// =========================
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
});

// =========================
// POST /users → créer un utilisateur
// =========================
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
});

// =========================
// DELETE /users/:id → supprimer un utilisateur
// =========================
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ status: 'deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
});

// Export du routeur
module.exports = router;