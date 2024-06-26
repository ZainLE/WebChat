const express = require('express');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect('mongodb://localhost:27017/webchat', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected successfully');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}));

let users = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('login', async (username) => {
    const userId = uuidv4();
    const user = new User({ username, userId });
    try {
      await user.save();
      users[socket.id] = { username, userId };
      socket.emit('loginSuccess', { username, userId });
      io.emit('userList', Object.values(users));
      console.log(`${username} logged in with ID: ${userId}`);
    } catch (error) {
      console.error('Error logging in user:', error);
      socket.emit('loginError', 'Username already taken');
    }
  });

  socket.on('sendMessage', async (message) => {
    const user = users[socket.id];
    if (user) {
      const msg = new Message({ username: user.username, message });
      await msg.save();
      io.emit('receiveMessage', { username: user.username, message });
    }
  });

  socket.on('disconnect', async () => {
    const user = users[socket.id];
    if (user) {
      delete users[socket.id];
      await User.deleteOne({ userId: user.userId });
      io.emit('userList', Object.values(users));
      console.log(`${user.username} disconnected`);
    }
  });
});

module.exports = { app, server };
