const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createLesson, getLessonsByClass, deleteLesson, getAllUserLessons } = require('../controllers/lessonController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/', authMiddleware, roleMiddleware('Teacher'), upload.single('file'), createLesson);
router.get('/user/all', authMiddleware, getAllUserLessons);
router.get('/:classId', authMiddleware, getLessonsByClass);
router.delete('/:id', authMiddleware, roleMiddleware('Teacher'), deleteLesson);

module.exports = router;
