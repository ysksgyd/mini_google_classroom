const express = require('express');
const router = express.Router();
const { createClass, getClasses, joinClass, getClassById, deleteClass } = require('../controllers/classController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, roleMiddleware('Teacher'), createClass);
router.get('/', authMiddleware, getClasses);
router.post('/join', authMiddleware, joinClass);
router.get('/:id', authMiddleware, getClassById);
router.delete('/:id', authMiddleware, roleMiddleware('Teacher'), deleteClass);

module.exports = router;
