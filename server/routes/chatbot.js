const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { chat } = require('../controllers/chatbotController');

// POST /api/chatbot — Send a message and get AI response
router.post('/', authMiddleware, chat);

module.exports = router;
