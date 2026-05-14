const User = require('../models/User');
const OTP = require('../models/OTP');
const Class = require('../models/Class');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Announcement = require('../models/Announcement');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendRegistrationEmail, sendOTPEmail } = require('../utils/email');

exports.startRegister = async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const { name, password, role } = req.body;
  console.log('--- START REGISTER CALL ---', { name, email, role });

  // 1. Validate Gmail
  if (!email.endsWith('@gmail.com')) {
    console.log('--- GMAIL VALIDATION FAILED ---');
    return res.status(400).json({ msg: 'Only @gmail.com accounts are accepted.' });
  }

  try {
    // 2. Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists with this email.' });
    }

    // 3. Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Save/Update OTP in DB
    await OTP.findOneAndUpdate({ email }, { otp: otpCode }, { upsert: true, new: true });

    // 5. Send OTP Email
    try {
      await sendOTPEmail(email, otpCode);
      res.json({ msg: 'Verification code sent! Please check your Gmail. It should arrive within seconds.' });
    } catch (emailError) {
      console.error('SMTP Error during OTP send:', emailError.message);
      return res.status(500).json({ msg: 'Failed to send verification code. Please check your internet connection or try again later.' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Unable to send verification code. Please try again later.' });
  }
};

// Step 2: Verify OTP and Create User
exports.verifyOTP = async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const { name, password, role, otp, course, year } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email, otp });
    const isDevBypass = process.env.NODE_ENV === 'development' && otp === '999999';
    
    if (!otpRecord && !isDevBypass) {
      return res.status(400).json({ msg: 'Invalid or expired OTP.' });
    }
    
    if (otpRecord) {
      await OTP.deleteOne({ _id: otpRecord._id });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'Registration already completed' });

    // Generate Course Code for Students
    let generatedCourseCode = null;
    if (role === 'Student') {
      generatedCourseCode = `${course.toUpperCase().replace(/\s+/g, '')}-${year}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    }

    user = new User({ 
      name, 
      email, 
      password, 
      role, 
      course: course?.toUpperCase(), 
      year, 
      courseCode: generatedCourseCode,
      isCourseVerified: role === 'Teacher' // Teachers don't need this step
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // Send Welcome Email (Non-blocking but better handled)
    sendRegistrationEmail(user).catch(err => console.error('Welcome Email SMTP Error:', err.message));

    const payload = { 
      _id: user._id, 
      id: user._id,
      name: user.name, 
      email: user.email, 
      role: user.role, 
      course: user.course, 
      year: user.year,
      isCourseVerified: user.isCourseVerified,
      courseCode: user.courseCode 
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: payload });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Registration could not be completed. Please try again.' });
  }
};

exports.login = async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const { password, role } = req.body;
  console.log('--- LOGIN ATTEMPT ---', { email, role });

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Role check: Ensure registered role matches requested login role
    if (user.role !== role) {
      return res.status(403).json({ 
        msg: `Unauthorized: This account is registered as a ${user.role}. Please login via the ${user.role} portal.` 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      course: user.course,
      year: user.year,
      isCourseVerified: user.isCourseVerified
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: payload });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Login failed due to a server issue. Please try again.' });
  }
};

exports.verifyCourseCode = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (user.courseCode?.trim().toUpperCase() !== code?.trim().toUpperCase()) {
      return res.status(400).json({ msg: 'Invalid Course Code. Please check and try again.' });
    }

    user.isCourseVerified = true;
    await user.save();

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      course: user.course,
      year: user.year,
      isCourseVerified: user.isCourseVerified
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: payload });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Verification failed' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Unable to load your profile. Please refresh the page.' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.role === 'Teacher') {
      // Find classes led by this teacher
      const classes = await Class.find({ teacherId: userId });
      const classIds = classes.map(c => c._id);

      // Cascading deletion
      await Submission.deleteMany({ classId: { $in: classIds } });
      await Assignment.deleteMany({ classId: { $in: classIds } });
      await Announcement.deleteMany({ classId: { $in: classIds } });
      await Class.deleteMany({ teacherId: userId });
    } else {
      // Student Deletion Logic
      // 1. Remove from all classes
      await Class.updateMany(
        { students: userId },
        { $pull: { students: userId } }
      );

      // 2. Delete submissions
      await Submission.deleteMany({ studentId: userId });

      // 3. Remove comments and replies
      await Announcement.updateMany(
        {},
        { $pull: { comments: { userId: userId } } }
      );
      
      await Announcement.updateMany(
        {},
        { $pull: { "comments.$[].replies": { userId: userId } } }
      );
    }

    // Finally, delete the user itself
    await User.findByIdAndDelete(userId);

    res.json({ msg: 'Your account and all associated data have been permanently removed.' });
  } catch (err) {
    console.error('Account Deletion Error:', err);
    res.status(500).json({ msg: 'Could not delete your account right now. Please try again later.' });
  }
};

exports.updateCourseInfo = async (req, res) => {
  const { course, year } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.course = course?.toUpperCase();
    user.year = year;
    await user.save();

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      course: user.course,
      year: user.year,
      isCourseVerified: user.isCourseVerified
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: payload });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Failed to update your academic information. Please try again.' });
  }
};

exports.updateProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'Please provide an image file.' });
    }

    const userId = req.user.id;
    const profilePicture = req.file.path.replace(/\\/g, '/');

    const user = await User.findById(userId);
    user.profilePicture = profilePicture;
    await user.save();

    const updatedUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      course: user.course,
      year: user.year,
      courseCode: user.courseCode,
      isCourseVerified: user.isCourseVerified,
      profilePicture: user.profilePicture
    };

    res.json(updatedUser);
  } catch (err) {
    console.error('Profile pic error:', err.message);
    res.status(500).json({ msg: 'Failed to update profile picture.' });
  }
};
