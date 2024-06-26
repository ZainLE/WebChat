const socket = io();

function login() {
  const username = document.getElementById('usernameInput').value;
  if (username) {
    socket.emit('login', username);
  }
}

socket.on('loginSuccess', (data) => {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('chatPage').style.display = 'flex';
});

socket.on('loginError', (message) => {
  alert(message);
});

socket.on('userList', (users) => {
  const userList = document.getElementById('userList');
  userList.innerHTML = '<h3>Connected Users</h3>';
  users.forEach(user => {
    const userDiv = document.createElement('div');
    userDiv.innerText = user.username;
    userList.appendChild(userDiv);
  });
});

function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value;
  if (message) {
    socket.emit('sendMessage', message);
    messageInput.value = '';
  }
}

socket.on('receiveMessage', (msg) => {
  const messages = document.getElementById('messages');
  const messageDiv = document.createElement('div');
  messageDiv.innerText = `${msg.username}: ${msg.message}`;
  messages.appendChild(messageDiv);
  messages.scrollTop = messages.scrollHeight;
});
