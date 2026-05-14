const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

router.get('/', auth.authMiddleware, notificationController.getNotifications);
router.patch('/:id', auth.authMiddleware, notificationController.markAsRead);
router.patch('/mark/all', auth.authMiddleware, notificationController.markAllAsRead);
router.delete('/', auth.authMiddleware, notificationController.deleteAllNotifications);

module.exports = router;
