const express = require('express');
const multer = require('multer');
const path = require('path');
const Message = require('../models/Message');
const Channel = require('../models/Channel');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/channels/:channelId', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    const channel = await Channel.findById(req.params.channelId);
    if (!channel) {
      return res.status(404).json({ success: false, error: 'Channel not found' });
    }

    const message = new Message({
      content: content.trim(),
      sender: req.user._id,
      channel: req.params.channelId,
      type: 'text',
    });
    await message.save();
    await message.populate('sender', 'username avatar');

    const io = req.app.get('io');
    if (io) {
      io.to(`channel:${req.params.channelId}`).emit('new-message', {
        success: true,
        data: { message },
      });
    }

    res.status(201).json({ success: true, data: { message } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/channels/:channelId/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const channel = await Channel.findById(req.params.channelId);
    if (!channel) {
      return res.status(404).json({ success: false, error: 'Channel not found' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const message = new Message({
      sender: req.user._id,
      channel: req.params.channelId,
      type: 'file',
      fileUrl,
      fileName: req.file.originalname,
      content: req.file.originalname,
    });
    await message.save();
    await message.populate('sender', 'username avatar');

    const io = req.app.get('io');
    if (io) {
      io.to(`channel:${req.params.channelId}`).emit('new-message', {
        success: true,
        data: { message },
      });
    }

    res.status(201).json({ success: true, data: { message } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    message.content = req.body.content || message.content;
    message.updatedAt = new Date();
    await message.save();
    await message.populate('sender', 'username avatar');

    const io = req.app.get('io');
    if (io) {
      io.to(`channel:${message.channel}`).emit('message-updated', {
        success: true,
        data: { message },
      });
    }

    res.json({ success: true, data: { message } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const channelId = message.channel;
    await message.deleteOne();

    const io = req.app.get('io');
    if (io) {
      io.to(`channel:${channelId}`).emit('message-deleted', {
        success: true,
        data: { messageId: req.params.id, channelId },
      });
    }

    res.json({ success: true, data: { message: 'Message deleted' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:id/react', async (req, res) => {
  try {
    const { emoji } = req.body;
    if (!emoji) {
      return res.status(400).json({ success: false, error: 'Emoji is required' });
    }

    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    const userId = req.user._id.toString();
    const reactionIndex = message.reactions.findIndex((r) => r.emoji === emoji);

    if (reactionIndex > -1) {
      const userIndex = message.reactions[reactionIndex].users
        .map((u) => u.toString())
        .indexOf(userId);
      if (userIndex > -1) {
        message.reactions[reactionIndex].users.splice(userIndex, 1);
        if (message.reactions[reactionIndex].users.length === 0) {
          message.reactions.splice(reactionIndex, 1);
        }
      } else {
        message.reactions[reactionIndex].users.push(req.user._id);
      }
    } else {
      message.reactions.push({ emoji, users: [req.user._id] });
    }

    await message.save();
    await message.populate('sender', 'username avatar');

    const io = req.app.get('io');
    if (io) {
      io.to(`channel:${message.channel}`).emit('message-updated', {
        success: true,
        data: { message },
      });
    }

    res.json({ success: true, data: { message } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
