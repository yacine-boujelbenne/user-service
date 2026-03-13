
// Import d'Express et création du routeur
const express = require('express');
const router = express.Router();

// Import de Mongoose
const mongoose = require('mongoose');

// Définition du schéma Post
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, default: 'Anonymous' },
  likes: [{ type: String }], // Array of userIds who liked
  createdAt: { type: Date, default: Date.now }
});

// Création du modèle Post
const Post = mongoose.model('Post', postSchema);

// =========================
// GET /posts → récupérer tous les posts
// =========================
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts', details: error.message });
  }
});

// =========================
// GET /posts/:id → récupérer un post par ID
// =========================
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post', details: error.message });
  }
});

// =========================
// POST /posts → créer un post
// =========================
router.post('/', async (req, res) => {
  try {
    const post = new Post(req.body);
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post', details: error.message });
  }
});

// =========================
// PUT /posts/:id/like → toggle like on a post
// =========================
router.put('/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const index = post.likes.indexOf(userId);
    if (index === -1) {
      // Add like
      post.likes.push(userId);
    } else {
      // Remove like (unlike)
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like', details: error.message });
  }
});

// =========================
// PUT /posts/:id → mettre à jour un post
// =========================
router.put('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post', details: error.message });
  }
});

// =========================
// DELETE /posts/:id → supprimer un post
// =========================
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ status: 'deleted', post });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post', details: error.message });
  }
});

// Export du routeur
module.exports = router;
