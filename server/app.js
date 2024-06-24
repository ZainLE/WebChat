const express = require('express');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

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

  socket.on('login', (username) => {
    const userId = uuidv4();
    users[socket.id] = { username, userId };
    socket.emit('loginSuccess', { username, userId });
    io.emit('userList', Object.values(users));
    console.log(`${username} logged in with ID: ${userId}`);
  });

  socket.on('sendMessage', (message) => {
    const user = users[socket.id];
    if (user) {
      const msg = { username: user.username, message };
      io.emit('receiveMessage', msg);
    }
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      delete users[socket.id];
      io.emit('userList', Object.values(users));
      console.log(`${user.username} disconnected`);
    }
  });
});

module.exports = { app, server };
