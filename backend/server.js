const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const http = require('http');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aura-social')
  .then(() => console.log('✨ MongoDB Connected'))
  .catch(err => console.error(err));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '✨ Aura Social is running' });
});

io.on('connection', (socket) => {
  console.log('🌟 User connected:', socket.id);
  socket.on('join-room', (roomId) => socket.join(roomId));
  socket.on('message', (data) => io.to(data.roomId).emit('new-message', data));
  socket.on('disconnect', () => console.log('👋 User disconnected'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✨ Backend running on port ${PORT}`));
