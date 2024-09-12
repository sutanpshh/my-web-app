const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

const db = new sqlite3.Database('./chat.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to SQLite database.');
});

db.run(`CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  message TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

function saveMessage(username, message) {
  db.run(`INSERT INTO messages (username, message) VALUES (?, ?)`, [username, message], function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Message saved: ${message}`);
  });
}

function getMessages(callback) {
  db.all(`SELECT username, message, timestamp FROM messages ORDER BY timestamp`, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    callback(rows);
  });
}

app.use(express.static('public'));

io.on('connection', socket => {
  console.log('User connected');

  getMessages((messages) => {
    messages.forEach((msg) => {
      socket.emit('chat-message', { name: msg.username, message: msg.message });
    });
  });

  socket.on('send-chat-message', message => {
    console.log('Received message:', message);
    const username = 'User'; // Gantilah sesuai dengan pengguna yang terhubung
    saveMessage(username, message);
    socket.broadcast.emit('chat-message', { name: username, message: message });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
