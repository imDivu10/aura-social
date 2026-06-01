const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const http = require('http');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');
const friendRoutes = require('./routes/friends');
const callRoutes = require('./routes/calls');
const gameRoutes = require('./routes/games');
const postRoutes = require('./routes/posts');
const reelRoutes = require('./routes/reels');
const storyRoutes = require('./routes/stories');
const jokeRoutes = require('./routes/jokes');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aura-social')
  .then(() => console.log('✨ MongoDB Connected'))
  .catch(err => console.error('DB Error:', err));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '✨ Aura Social Backend' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/jokes', jokeRoutes);

// Socket.io Real-time Events
io.on('connection', (socket) => {
  console.log('🌟 Connected:', socket.id);

  // Join room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit('user-joined', { userId: socket.id });
  });

  // Send message
  socket.on('message', (data) => {
    io.to(data.roomId).emit('new-message', data);
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.broadcast.to(data.roomId).emit('user-typing', { userId: socket.id });
  });

  // Call events
  socket.on('call-initiated', (data) => {
    io.to(data.receiverSocketId).emit('incoming-call', data);
  });

  socket.on('call-accepted', (data) => {
    io.to(data.roomId).emit('call-accepted', data);
  });

  socket.on('call-rejected', (data) => {
    io.to(data.roomId).emit('call-rejected', data);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('👋 Disconnected:', socket.id);
    io.emit('user-offline', { userId: socket.id });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✨ Aura Backend running on port ${PORT}`);
});
