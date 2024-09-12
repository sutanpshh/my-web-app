const socket = io('http://localhost:3000');

const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = messageInput.value;
  if (message) {
    socket.emit('send-chat-message', message);
    messageInput.value = '';
  }
});

socket.on('chat-message', data => {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  
  // Menambahkan kelas berdasarkan pengirim pesan
  if (data.name === 'User') {
    messageElement.classList.add('user');
  } else {
    messageElement.classList.add('partner');
  }
  
  messageElement.textContent = `${data.name}: ${data.message}`;
  messageContainer.append(messageElement);
  messageContainer.scrollTop = messageContainer.scrollHeight;
});
