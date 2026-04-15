const express = require('express');
const User = require('../models/User');
const DirectMessage = require('../models/DirectMessage');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const query = req.query.username
      ? { username: { $regex: req.query.username, $options: 'i' } }
      : {};
    const users = await User.find(query).select('-password').limit(20);
    res.json({ success: true, data: { users } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id/dm', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const total = await DirectMessage.countDocuments({
      $or: [
        { sender: req.user._id, recipient: req.params.id },
        { sender: req.params.id, recipient: req.user._id },
      ],
    });

    const messages = await DirectMessage.find({
      $or: [
        { sender: req.user._id, recipient: req.params.id },
        { sender: req.params.id, recipient: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username avatar')
      .populate('recipient', 'username avatar');

    res.json({
      success: true,
      data: {
        messages,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: { user } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:id/dm', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    const recipient = await User.findById(req.params.id);
    if (!recipient) {
      return res.status(404).json({ success: false, error: 'Recipient not found' });
    }

    const dm = new DirectMessage({
      content: content.trim(),
      sender: req.user._id,
      recipient: req.params.id,
      type: 'text',
    });
    await dm.save();
    await dm.populate('sender', 'username avatar');
    await dm.populate('recipient', 'username avatar');

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.params.id}`).emit('new-dm', { success: true, data: { message: dm } });
      io.to(`user:${req.user._id}`).emit('new-dm', { success: true, data: { message: dm } });
    }

    res.status(201).json({ success: true, data: { message: dm } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
