const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const { scheduleMeeting, getMeetingsByTeacher, getMeetingsForStudent, getMeetingsByClass } = require('../controllers/meetingController');

router.post('/schedule', authMiddleware, roleMiddleware('Teacher'), scheduleMeeting);
router.get('/teacher', authMiddleware, roleMiddleware('Teacher'), getMeetingsByTeacher);
router.get('/student', authMiddleware, roleMiddleware('Student'), getMeetingsForStudent);
router.get('/class/:classId', authMiddleware, getMeetingsByClass);

module.exports = router;
