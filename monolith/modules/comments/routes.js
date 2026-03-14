const express = require('express');
const Comment = require('./model');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const comments = await Comment.find().sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch comments', details: error.message });
    }
});

router.get('/post/:postId', async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId }).sort({ createdAt: 1 });

        const commentsMap = {};
        const rootComments = [];

        comments.forEach((comment) => {
            const obj = comment.toObject();
            obj.children = [];
            commentsMap[obj._id] = obj;
        });

        comments.forEach((comment) => {
            const obj = commentsMap[comment.toObject()._id];
            if (comment.parentId && commentsMap[comment.parentId]) {
                commentsMap[comment.parentId].children.push(obj);
            } else {
                rootComments.push(obj);
            }
        });

        res.json(rootComments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch comments', details: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const comment = new Comment(req.body);
        await comment.save();
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create comment', details: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.json({ status: 'deleted', comment });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete comment', details: error.message });
    }
});

router.put('/:id/like', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const index = comment.likes.indexOf(userId);
        if (index === -1) {
            comment.likes.push(userId);
        } else {
            comment.likes.splice(index, 1);
        }

        await comment.save();
        res.json(comment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle like', details: error.message });
    }
});

module.exports = router;
