const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, default: 'Anonymous' },
    likes: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Post || mongoose.model('Post', postSchema);
