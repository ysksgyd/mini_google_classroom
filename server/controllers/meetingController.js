const Meeting = require('../models/Meeting');
const Class = require('../models/Class');
const Notification = require('../models/Notification');
const { sendMeetingEmail } = require('../utils/email');

exports.scheduleMeeting = async (req, res) => {
  const { title, description, date, classId, meetingLink } = req.body;
  const teacherId = req.user.id;

  try {
    const classObj = await Class.findById(classId).populate('students');
    if (!classObj) return res.status(404).json({ msg: 'Class not found' });
    
    const classTeacherId = classObj.teacherId.toString();
    const currentUserId = (req.user.id || req.user._id).toString();
    
    if (classTeacherId !== currentUserId) {
      return res.status(403).json({ 
        msg: 'Access denied: You are not authorized to schedule meetings for this class. Only the assigned teacher has this permission.' 
      });
    }

    
    const meeting = new Meeting({
      title,
      description,
      date,
      classId,
      teacherId: classObj.teacherId, 
      meetingLink
    });

    await meeting.save();

    // Create notifications for all students
    const notifications = classObj.students.map(student => ({
      recipient: student._id,
      sender: teacherId,
      type: 'Announcement',
      content: `A new online class "${title}" has been scheduled for ${new Date(date).toLocaleString()}`,
      link: `/online-class`
    }));
    await Notification.insertMany(notifications);

    // Send emails
    sendMeetingEmail(classObj.students, meeting, classObj.title).catch(err => console.error('Meeting Email Error:', err));

    res.json(meeting);


  } catch (err) {
    console.error('SERVER ERROR schedules meeting:', err);
    res.status(500).json({ msg: 'Could not schedule the online class. Please try again.' });
  }
};

exports.getMeetingsByTeacher = async (req, res) => {
  try {
    const classes = await Class.find({ teacherId: req.user.id }).select('_id');
    const classIds = classes.map(c => c._id);
    const meetings = await Meeting.find({ classId: { $in: classIds } }).sort({ date: 1 }).populate('classId', 'title');
    res.json(meetings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Could not load your scheduled classes. Please refresh the page.' });
  }
};

exports.getMeetingsForStudent = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const studentId = new mongoose.Types.ObjectId(req.user.id);
    console.log('[GET MEETINGS FOR STUDENT] Checking for User ID (ObjectId):', studentId);
    
    // Find classes where student is enrolled
    const classes = await Class.find({ students: studentId }).select('_id');
    console.log('[GET MEETINGS FOR STUDENT] Classes found:', classes.length, 'classes');
    
    const classIds = classes.map(c => c._id);
    const meetings = await Meeting.find({ classId: { $in: classIds } })
      .sort({ date: 1 })
      .populate('classId', 'title');
      
    console.log('[GET MEETINGS FOR STUDENT] Meetings found:', meetings.length, 'meetings');
    res.json(meetings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Could not load your upcoming classes. Please refresh the page.' });
  }
};
exports.getMeetingsByClass = async (req, res) => {
  try {
    const meetings = await Meeting.find({ classId: req.params.classId })
      .sort({ date: 1 })
      .populate('classId', 'title');
    res.json(meetings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Could not load class meetings.' });
  }
};
