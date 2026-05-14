const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  createAssignment, 
  getAssignmentsByClass, 
  submitAssignment, 
  getSubmissionsByAssignment, 
  createAnnouncement, 
  getAnnouncementsByClass, 
  getAssignmentById, 
  getAllUserAssignments, 
  giveFeedback,
  getMySubmission,
  addComment,
  addReply,
  getPendingWork,
  getSubmissionsByClass
} = require('../controllers/assignmentController');
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

// --- POST routes ---
router.post('/', authMiddleware, roleMiddleware('Teacher'), upload.single('file'), createAssignment);
router.post('/submit', authMiddleware, upload.single('file'), submitAssignment);
router.post('/announcement', authMiddleware, roleMiddleware('Teacher'), createAnnouncement);
router.post('/feedback', authMiddleware, roleMiddleware('Teacher'), giveFeedback);
router.post('/comment', authMiddleware, addComment);
router.post('/reply', authMiddleware, addReply);

// --- GET: specific named paths MUST come before wildcard /:param routes ---
router.get('/user/all', authMiddleware, getAllUserAssignments);
router.get('/pending', authMiddleware, getPendingWork);
router.get('/detail/:id', authMiddleware, getAssignmentById);
router.get('/my-submission/:assignmentId', authMiddleware, getMySubmission);
router.get('/submissions/:assignmentId', authMiddleware, roleMiddleware('Teacher'), getSubmissionsByAssignment);
router.get('/submissions/class/:classId', authMiddleware, roleMiddleware('Teacher'), getSubmissionsByClass);
router.get('/announcements/:classId', authMiddleware, getAnnouncementsByClass);

// --- Wildcard param route LAST ---
router.get('/:classId', authMiddleware, getAssignmentsByClass);

module.exports = router;
