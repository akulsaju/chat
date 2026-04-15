require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatflow';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: null },
  status: { type: String, enum: ['online', 'offline', 'away'], default: 'offline' },
  createdAt: { type: Date, default: Date.now },
});

const channelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: '' },
  topic: { type: String, default: '' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPrivate: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const messageSchema = new mongoose.Schema({
  content: { type: String },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
  type: { type: String, enum: ['text', 'file'], default: 'text' },
  fileUrl: { type: String },
  fileName: { type: String },
  reactions: [{ emoji: String, users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const directMessageSchema = new mongoose.Schema({
  content: { type: String },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['text', 'file'], default: 'text' },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Channel = mongoose.model('Channel', channelSchema);
const Message = mongoose.model('Message', messageSchema);
const DirectMessage = mongoose.model('DirectMessage', directMessageSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  await Promise.all([
    User.deleteMany({}),
    Channel.deleteMany({}),
    Message.deleteMany({}),
    DirectMessage.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const [alice, bob, charlie] = await User.insertMany([
    { username: 'alice', email: 'alice@chatflow.dev', password: hashedPassword, status: 'online' },
    { username: 'bob', email: 'bob@chatflow.dev', password: hashedPassword, status: 'offline' },
    { username: 'charlie', email: 'charlie@chatflow.dev', password: hashedPassword, status: 'away' },
  ]);
  console.log('Created users: alice, bob, charlie');

  const [general, random, announcements] = await Channel.insertMany([
    {
      name: 'general',
      description: 'General discussion for the whole team',
      topic: 'Welcome to ChatFlow!',
      createdBy: alice._id,
      members: [alice._id, bob._id, charlie._id],
    },
    {
      name: 'random',
      description: 'Off-topic conversations, memes, and fun',
      topic: 'Anything goes here 🎉',
      createdBy: bob._id,
      members: [alice._id, bob._id, charlie._id],
    },
    {
      name: 'announcements',
      description: 'Important announcements for the team',
      topic: 'Read-only announcements channel',
      createdBy: alice._id,
      members: [alice._id, bob._id, charlie._id],
    },
  ]);
  console.log('Created channels: #general, #random, #announcements');

  const now = new Date();
  const minutesAgo = (m) => new Date(now - m * 60 * 1000);

  await Message.insertMany([
    {
      content: 'Welcome everyone to ChatFlow! 🎉 This is our new team communication platform.',
      sender: alice._id,
      channel: general._id,
      createdAt: minutesAgo(60),
      updatedAt: minutesAgo(60),
    },
    {
      content: 'Thanks for setting this up, Alice! Looking good 👍',
      sender: bob._id,
      channel: general._id,
      createdAt: minutesAgo(55),
      updatedAt: minutesAgo(55),
    },
    {
      content: 'This is way better than emails! Excited to get started.',
      sender: charlie._id,
      channel: general._id,
      createdAt: minutesAgo(50),
      updatedAt: minutesAgo(50),
    },
    {
      content: 'Make sure to check out the #random channel for some fun stuff.',
      sender: alice._id,
      channel: general._id,
      createdAt: minutesAgo(45),
      updatedAt: minutesAgo(45),
    },
    {
      content: 'Has anyone seen that new JavaScript framework? It\'s called Bun now apparently 🙈',
      sender: bob._id,
      channel: random._id,
      createdAt: minutesAgo(40),
      updatedAt: minutesAgo(40),
    },
    {
      content: 'lol yes! The JavaScript ecosystem never stops 😂',
      sender: charlie._id,
      channel: random._id,
      createdAt: minutesAgo(38),
      updatedAt: minutesAgo(38),
    },
    {
      content: 'At least it\'s fast! 🚀',
      sender: alice._id,
      channel: random._id,
      createdAt: minutesAgo(35),
      updatedAt: minutesAgo(35),
    },
    {
      content: '📢 Welcome to ChatFlow! Please read the onboarding docs before your first day.',
      sender: alice._id,
      channel: announcements._id,
      createdAt: minutesAgo(30),
      updatedAt: minutesAgo(30),
    },
    {
      content: 'Team meeting this Friday at 3pm UTC. Add it to your calendars!',
      sender: alice._id,
      channel: announcements._id,
      createdAt: minutesAgo(20),
      updatedAt: minutesAgo(20),
    },
    {
      content: 'Hey, are we still on for the code review session tomorrow?',
      sender: alice._id,
      channel: general._id,
      createdAt: minutesAgo(10),
      updatedAt: minutesAgo(10),
    },
  ]);
  console.log('Created sample channel messages');

  await DirectMessage.insertMany([
    {
      content: 'Hey Bob! Can you review my PR when you get a chance?',
      sender: alice._id,
      recipient: bob._id,
      createdAt: minutesAgo(25),
    },
    {
      content: 'Sure thing Alice! I\'ll take a look this afternoon.',
      sender: bob._id,
      recipient: alice._id,
      createdAt: minutesAgo(22),
    },
  ]);
  console.log('Created DM messages between Alice and Bob');

  console.log('\n✅ Seed complete!');
  console.log('──────────────────────────────');
  console.log('Login credentials (all use password: password123):');
  console.log('  alice@chatflow.dev');
  console.log('  bob@chatflow.dev');
  console.log('  charlie@chatflow.dev');
  console.log('──────────────────────────────');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
