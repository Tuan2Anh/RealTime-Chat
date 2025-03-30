const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // Dùng axios để gửi HTTP request
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = 4001;

const SECRET_KEY = 'your_secret_key';
const STORAGE_SERVER_URL = process.env.STORAGE_SERVER_URL;

require('dotenv').config();


io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('message', (data) => {
    try {
      const { token, message } = data;
      const decoded = jwt.verify(token, SECRET_KEY);

      console.log(`User ${decoded.username} sent: ${message}`);

      // Gửi tin nhắn đến tất cả các client
      io.emit('message', { user: decoded.username, message });
      
      // Gửi tin nhắn tới Storage Server để lưu trữ
      axios.post('${STORAGE_SERVER_URL}/messages', {
      user: decoded.username,
      message,
    }).catch(err => {
      console.error('Failed to save message to storage:', err.message);
    });
    } catch (err) {
      console.error('Error:', err.message);
      socket.emit('error', { error: 'Invalid token or message format' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => console.log(`Message Server running on port ${PORT}`));
