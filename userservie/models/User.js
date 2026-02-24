const mongoose = require('mongoose');

// Définition du schéma User
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Création du modèle User
const User = mongoose.model('User', userSchema);

module.exports = User;
