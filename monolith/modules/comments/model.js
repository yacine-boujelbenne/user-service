const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    postId: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, default: 'Anonymous' },
    likes: [{ type: String }],
    parentId: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
