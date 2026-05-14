const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  startRegister, 
  verifyOTP, 
  login, 
  getUserProfile, 
  deleteAccount, 
  updateCourseInfo, 
  verifyCourseCode,
  updateProfilePic
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-profile-' + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/start-register', startRegister);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/verify-course-code', authMiddleware, verifyCourseCode);
router.get('/profile', authMiddleware, getUserProfile);
router.put('/update-course', authMiddleware, updateCourseInfo);
router.post('/update-profile-pic', authMiddleware, upload.single('profilePic'), updateProfilePic);
router.delete('/delete-account', authMiddleware, deleteAccount);

module.exports = router;
