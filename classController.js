const Class = require('../models/Class');
const User = require('../models/User');
const crypto = require('crypto');

exports.createClass = async (req, res) => {
  const { title, subject, description } = req.body;
  const teacherId = req.user.id;

  try {
    const classCode = crypto.randomBytes(3).toString('hex').toLowerCase() + '-' + crypto.randomBytes(2).toString('hex').toLowerCase();

    const newClass = new Class({
      title,
      subject,
      description,
      classCode,
      course: req.user.course,
      year: req.user.year,
      teacherId,
      students: []
    });

    await newClass.save();
    res.json(newClass);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Could not create the class. Please try again.' });
  }
};

exports.getClasses = async (req, res) => {
  try {
    const { course, year } = req.user;
    if (req.user.role === 'Teacher') {
      const classes = await Class.find({ 
        teacherId: req.user.id, 
        course: { $regex: new RegExp(`^${course}$`, 'i') }, 
        year 
      }).populate('teacherId', 'name email');
      res.json(classes);
    } else {
      const classes = await Class.find({ 
        students: req.user.id, 
        course: { $regex: new RegExp(`^${course}$`, 'i') }, 
        year 
      }).populate('teacherId', 'name email');
      res.json(classes);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Could not load your classes. Please refresh the page.' });
  }
};

exports.joinClass = async (req, res) => {
  const { classCode } = req.body;
  const studentId = req.user.id;

  try {
    const classToJoin = await Class.findOne({ classCode: classCode.toLowerCase() });

    if (!classToJoin) {
      return res.status(404).json({ msg: 'Class not found' });
    }



    if (classToJoin.students.includes(studentId)) {
      return res.status(400).json({ msg: 'Already joined this class' });
    }

    classToJoin.students.push(studentId);
    await classToJoin.save();

    res.json(classToJoin);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Could not join the class. Please check the code and try again.' });
  }
};

exports.getClassById = async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id)
      .populate('teacherId', 'name email lastActive')
      .populate('students', 'name email lastActive');

    if (!classObj) {
      return res.status(404).json({ msg: 'Class not found' });
    }

    const userId = req.user.id;
    const isTeacher = classObj.teacherId._id.toString() === userId;

    // Check student membership using a direct DB query (most reliable)
    const isMember = await Class.exists({ _id: req.params.id, students: userId });

    if (!isTeacher && !isMember) {
      return res.status(403).json({ msg: 'Access denied: You are not a member of this class.' });
    }

    res.json(classObj);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Could not load class details. Please try again.' });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id);
    if (!classObj) {
      return res.status(404).json({ msg: 'Class not found' });
    }

    if (classObj.teacherId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to delete this class' });
    }

    const Assignment = require('../models/Assignment');
    const Submission = require('../models/Submission');
    const Announcement = require('../models/Announcement');

    // Cascading deletion for standard associated records
    await Submission.deleteMany({ classId: req.params.id });
    await Assignment.deleteMany({ classId: req.params.id });
    await Announcement.deleteMany({ classId: req.params.id });

    // Actually delete the class
    await Class.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Class removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
