const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const https = require('https');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// SSL configuration for local development
let httpsOptions = {};
try {
  const certPath = path.join(__dirname, 'localhost.pem');
  const keyPath = path.join(__dirname, 'localhost-key.pem');

  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
    console.log('✅ Loaded trusted SSL certificates from mkcert');
  } else {
    console.error('❌ SSL certificates not found! Please run "mkcert localhost" in the server directory.');
  }
} catch (err) {
  console.error('Error setting up HTTPS:', err);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('Mini Google Classroom API is running on SECURE HTTPS...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/classes', require('./routes/class'));
app.use('/api/assignments', require('./routes/assignment'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/meetings', require('./routes/meeting'));
app.use('/api/lessons', require('./routes/lesson'));
app.use('/api/messages', require('./routes/message'));

const socketIo = require('socket.io');

// DB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    const { startDeadlineScheduler } = require('./utils/deadlineScheduler');
    startDeadlineScheduler();
    
    const server = https.createServer(httpsOptions, app);
    
    // Initialize Socket.io
    const io = socketIo(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    app.set('socketio', io);

    io.on('connection', (socket) => {
      socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`Socket ${socket.id} joined room for user: ${userId}`);
      });

      socket.on('typing', (data) => {
        socket.to(data.recipientId).emit('display_typing', {
          senderId: data.senderId,
          typing: data.typing
        });
      });

      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });

    server.listen(PORT, () => {
      console.log(`Server running on https://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
