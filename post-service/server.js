
// Chargement des variables d'environnement (.env)
require('dotenv').config();

// Import des dépendances
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialisation de l'application Express
const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Route de santé
app.get('/health', (req, res) => {
  res.json({ service: 'Post Service', status: 'UP', timestamp: new Date() });
});

// Import des routes posts
const postsRoutes = require('./routes/posts');
app.use('/posts', postsRoutes);

// Connexion à MongoDB Atlas
// Connexion à MongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      family: 4,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB Post connected');
  } catch (err) {
    console.log('❌ MongoDB Post error:', err.message);
    console.log('👉 TIP: Ensure your IP (197.240.87.202) is whitelisted in MongoDB Atlas.');
    setTimeout(connectDB, 10000);
  }
};
connectDB();
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('✅ MongoDB Posts connected');
});

// Lancement du serveur
app.listen(process.env.PORT, () => {
  console.log(
    `Post Service running on port ${process.env.PORT}`
  );
});
