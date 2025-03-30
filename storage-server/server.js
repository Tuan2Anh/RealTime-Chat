const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 4002;

app.use(express.json());

// app.use(cors({
//   origin: '*',
//   methods:['GET', 'POST'],
// }))

// Thay đổi này được thực hiện trong Auth Server, Message Server và Storage Server
const corsOptions = {
  origin: 'http://localhost:8080',  // Địa chỉ của API Gateway
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));


// Kết nối MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/chat', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Định nghĩa schema và model cho tin nhắn
const messageSchema = new mongoose.Schema({
  user: { type: String, required: true },
  message: { type: String, required: true },
  to: { type: String, required: true }, // Người nhận
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

// API: Lấy danh sách tất cả người dùng
app.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// API: Lưu tin nhắn mới
app.post('/messages', async (req, res) => {
  const { user, message, to } = req.body;
  if (!user || !message || !to) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    const newMessage = new Message({ user, message, to });
    await newMessage.save();
    res.status(201).json({ success: true, message: newMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// API: Lấy tất cả tin nhắn giữa hai người
app.get('/messages/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { $and: [{ user: user1 }, { to: user2 }] },
        { $and: [{ user: user2 }, { to: user1 }] },
      ],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

// Khởi động server
app.listen(PORT, () => console.log(`Storage Server running on port ${PORT}`));
