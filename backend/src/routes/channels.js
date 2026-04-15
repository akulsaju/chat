const express = require('express');
const Channel = require('../models/Channel');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const channels = await Channel.find({
      $or: [{ isPrivate: false }, { members: req.user._id }],
    }).populate('createdBy', 'username avatar');
    res.json({ success: true, data: { channels } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, topic, isPrivate } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Channel name is required' });
    }

    const cleanName = name.toLowerCase().replace(/\s+/g, '-');
    const channel = new Channel({
      name: cleanName,
      description: description || '',
      topic: topic || '',
      isPrivate: !!isPrivate,
      createdBy: req.user._id,
      members: [req.user._id],
    });
    await channel.save();
    await channel.populate('createdBy', 'username avatar');
    res.status(201).json({ success: true, data: { channel } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, error: 'Channel name already taken' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id).populate(
      'members',
      'username avatar status'
    );
    if (!channel) {
      return res.status(404).json({ success: false, error: 'Channel not found' });
    }
    res.json({ success: true, data: { channel } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:id/join', async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ success: false, error: 'Channel not found' });
    }

    const isMember = channel.members.some((m) => m.toString() === req.user._id.toString());
    if (!isMember) {
      channel.members.push(req.user._id);
      await channel.save();
    }

    await channel.populate('members', 'username avatar status');
    res.json({ success: true, data: { channel } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:id/leave', async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ success: false, error: 'Channel not found' });
    }

    channel.members = channel.members.filter((m) => m.toString() !== req.user._id.toString());
    await channel.save();
    res.json({ success: true, data: { message: 'Left channel' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id/messages', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const total = await Message.countDocuments({ channel: req.params.id });
    const messages = await Message.find({ channel: req.params.id })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username avatar');

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

module.exports = router;
