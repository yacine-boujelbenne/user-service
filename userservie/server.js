
// Chargement des variables d’environnement (.env)
require('dotenv').config();

// Import des dépendances
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialisation de l’application Express
const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Route de santé
app.get('/health', (req, res) => {
  res.json({ service: 'User Service', status: 'UP', timestamp: new Date() });
});

// Import des routes utilisateurs
const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

// Import des routes d'authentification
const authRoutes = require('./routes/auth/auth');
app.use('/auth', authRoutes);

// Connexion à MongoDB Atlas
// Connexion à MongoDB Atlas
// Connexion à MongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      family: 4,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB User connected');
  } catch (err) {
    console.log('❌ MongoDB User error:', err.message);
    console.log('👉 TIP: Ensure your IP (196.203.130.3) is whitelisted in MongoDB Atlas: https://cloud.mongodb.com/');
    setTimeout(connectDB, 10000);
  }
};
connectDB();
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('✅ MongoDB User connected');
});

// Lancement du serveur
app.listen(process.env.PORT, () => {
  console.log(
    `User Service running on port ${process.env.PORT}`
  );
});
