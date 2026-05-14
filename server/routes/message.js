const express = require('express');
const router = express.Router();
const { sendMessage, getChat, getConversations, getAvailableContacts, clearConversation } = require('../controllers/messageController');
const { authMiddleware } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, 'msg_' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/send', authMiddleware, upload.single('file'), sendMessage);
router.get('/conversations', authMiddleware, getConversations);
router.get('/available-contacts', authMiddleware, getAvailableContacts);
router.get('/:otherUserId', authMiddleware, getChat);
router.delete('/:otherUserId', authMiddleware, clearConversation);

module.exports = router;
