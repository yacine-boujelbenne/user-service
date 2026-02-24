
// Import d'Express et création du routeur
const express = require('express');
const router = express.Router();

// Import de Mongoose
const mongoose = require('mongoose');

// Définition du schéma Comment
const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  postId: { type: String, required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Création du modèle Comment
const Comment = mongoose.model('Comment', commentSchema);

// =========================
// GET /comments → récupérer tous les commentaires
// =========================
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments', details: error.message });
  }
});

// =========================
// GET /comments/post/:postId → récupérer les commentaires d'un post
// =========================
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments for post:', error);
    res.status(500).json({ error: 'Failed to fetch comments', details: error.message });
  }
});

// =========================
// POST /comments → créer un commentaire
// =========================
router.post('/', async (req, res) => {
  try {
    const comment = new Comment(req.body);
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment', details: error.message });
  }
});

// =========================
// DELETE /comments/:id → supprimer un commentaire
// =========================
router.delete('/:id', async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.json({ status: 'deleted', comment });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment', details: error.message });
  }
});

// Export du routeur
module.exports = router;
