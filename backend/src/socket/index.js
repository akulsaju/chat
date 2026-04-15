const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

module.exports = function (io) {
  io.on('connection', async (socket) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        socket.disconnect();
        return;
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'chatflow_jwt_secret_development'
      );
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        socket.disconnect();
        return;
      }

      socket.userId = user._id.toString();
      socket.username = user.username;

      socket.join(`user:${socket.userId}`);

      await User.findByIdAndUpdate(socket.userId, { status: 'online' });
      io.emit('user-status', { userId: socket.userId, status: 'online' });

      socket.on('join-channel', (channelId) => {
        socket.join(`channel:${channelId}`);
      });

      socket.on('leave-channel', (channelId) => {
        socket.leave(`channel:${channelId}`);
      });

      socket.on('send-message', async ({ channelId, content }) => {
        try {
          const message = new Message({
            content,
            sender: socket.userId,
            channel: channelId,
            type: 'text',
          });
          await message.save();
          await message.populate('sender', 'username avatar');

          io.to(`channel:${channelId}`).emit('new-message', {
            success: true,
            data: { message },
          });
        } catch (err) {
          socket.emit('error', { message: err.message });
        }
      });

      socket.on('typing', ({ channelId }) => {
        socket.to(`channel:${channelId}`).emit('user-typing', {
          userId: socket.userId,
          username: socket.username,
          channelId,
        });
      });

      socket.on('stop-typing', ({ channelId }) => {
        socket.to(`channel:${channelId}`).emit('user-stop-typing', {
          userId: socket.userId,
          channelId,
        });
      });

      socket.on('disconnect', async () => {
        try {
          await User.findByIdAndUpdate(socket.userId, { status: 'offline' });
          io.emit('user-status', { userId: socket.userId, status: 'offline' });
        } catch (err) {
          console.error('Disconnect error:', err.message);
        }
      });
    } catch (err) {
      console.error('Socket auth error:', err.message);
      socket.disconnect();
    }
  });

  // Attach io to app for use in routes
  io.engine && io.engine.on('connection_error', (err) => {
    console.error('Socket connection error:', err);
  });

  return io;
};
