const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Class = require('../models/Class');
const Announcement = require('../models/Announcement');
const { sendAssignmentEmail, sendSubmissionConfirmationEmail } = require('../utils/email');
const Notification = require('../models/Notification');

exports.getPendingWork = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  try {
    const { course, year } = req.user;
    if (role === 'Student') {
      const classes = await Class.find({ students: userId, course, year });
      const classIds = classes.map(c => c._id);
      const assignments = await Assignment.find({ classId: { $in: classIds } }).populate('classId', 'title subject');
      const submissions = await Submission.find({ studentId: userId, assignmentId: { $in: assignments.map(a => a._id) } });
      const submittedIds = submissions.map(s => s.assignmentId.toString());
      const pending = assignments.filter(a => !submittedIds.includes(a._id.toString()));
      res.json({ pending });
    } else {
      const classes = await Class.find({ teacherId: userId, course, year }).populate('students', 'name email');
      const classIds = classes.map(c => c._id);
      const assignments = await Assignment.find({ classId: { $in: classIds } }).populate('classId', 'title subject');
      const submissions = await Submission.find({ classId: { $in: classIds } });
      const teacherPending = [];
      assignments.forEach(assignment => {
        const cls = classes.find(c => c._id.toString() === assignment.classId._id.toString());
        if (cls) {
          const submittedStudentIds = submissions
            .filter(s => s.assignmentId.toString() === assignment._id.toString())
            .map(s => s.studentId.toString());
          const missingStudents = cls.students.filter(student => !submittedStudentIds.includes(student._id.toString()));
          if (missingStudents.length > 0) {
            teacherPending.push({ assignment, missingStudents });
          }
        }
      });
      res.json({ teacherPending });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Could not fetch pending work' });
  }
};

exports.createAssignment = async (req, res) => {
  const { title, description, dueDate, classId } = req.body;
  const teacherId = req.user.id;

  console.log('[ASSIGNMENT] Attempting creation:', { title, classId, teacherId, hasFile: !!req.file });
  
  try {
    const classToUpdate = await Class.findById(classId).populate('students', 'email');
    if (!classToUpdate) {
      console.error('[ASSIGNMENT] Class not found:', classId);
      return res.status(404).json({ msg: 'Class not found' });
    }

    if (classToUpdate.teacherId.toString() !== teacherId) {
      console.warn('[ASSIGNMENT] Unauthorized attempt by:', teacherId);
      return res.status(403).json({ msg: 'Access denied: You are not the teacher of this class' });
    }

    const newAssignment = new Assignment({
      title,
      description,
      dueDate,
      classId,
      file: req.file ? req.file.path.replace(/\\/g, '/') : null
    });

    await newAssignment.save();
    console.log('[ASSIGNMENT] Created successfully ID:', newAssignment._id);

    // Send Assignment Email
    if (classToUpdate.students.length > 0) {
      sendAssignmentEmail(classToUpdate.students, newAssignment, classToUpdate.title).catch(err => console.error('Assignment Email SMTP Error:', err.message));
      
      const notifications = classToUpdate.students
        .filter(student => student._id.toString() !== teacherId)
        .map(student => ({
          recipient: student._id,
          sender: teacherId,
          type: 'Assignment',
          content: `New assignment posted in ${classToUpdate.title}: "${title}". It is due on ${new Date(dueDate).toLocaleDateString()}.`,
          link: `/assignment/${newAssignment._id}`
        }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.json(newAssignment);
  } catch (err) {
    console.error('SERVER ERROR:', err.message);
    res.status(500).json({ msg: 'Could not create the assignment. Please try again.' });
  }
};

exports.getAssignmentsByClass = async (req, res) => {
  const classId = req.params.classId;

  try {
    const assignments = await Assignment.find({ classId }).sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Could not load assignments. Please refresh the page.' });
  }
};

exports.submitAssignment = async (req, res) => {
  const { assignmentId, text, classId } = req.body;
  const studentId = req.user.id;
  
  console.log('Submission start for assignment', assignmentId);
  try {
    const existingSubmission = await Submission.findOne({ assignmentId, studentId });
    if (existingSubmission) {
      return res.status(400).json({ msg: 'You have already turned in this assignment.' });
    }

    const newSubmission = new Submission({
      assignmentId,
      studentId,
      classId,
      text,
      file: req.file ? req.file.path.replace(/\\/g, '/') : null
    });

    await newSubmission.save();
    console.log('Submission saved');
    
    // Notify the teacher
    const assignment = await Assignment.findById(assignmentId);
    if (assignment) {
      const cls = await Class.findById(classId);
      if (cls) {
        const teacherNotification = new Notification({
          recipient: cls.teacherId,
          sender: studentId,
          type: 'Assignment',
          content: `${req.user.name} submitted assignment: "${assignment.title}" in ${cls.title}`,
          link: `/assignment/${assignmentId}`
        });
        await teacherNotification.save();
      }

      // Re-enabling email confirmation with safety
      sendSubmissionConfirmationEmail(req.user.email, assignment.title, req.user.name).catch(err => console.error('Submission Email SMTP Error:', err.message));
    }

    res.json(newSubmission);
  } catch (err) {
    console.error('SERVER ERROR:', err.message);
    res.status(500).json({ msg: 'Your submission could not be saved. Please try again.' });
  }
};

exports.getSubmissionsByAssignment = async (req, res) => {
  const assignmentId = req.params.assignmentId;

  try {
    const submissions = await Submission.find({ assignmentId }).populate('studentId', 'name email');
    res.json(submissions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Could not load submissions. Please try again.' });
  }
};

exports.getSubmissionsByClass = async (req, res) => {
  const classId = req.params.classId;

  try {
    const submissions = await Submission.find({ classId })
      .populate('studentId', 'name email')
      .populate('assignmentId', 'title')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Could not load class submissions' });
  }
};

exports.createAnnouncement = async (req, res) => {
  const { text, classId } = req.body;
  const teacherId = req.user.id;

  try {
    const newAnnouncement = new Announcement({
      text,
      classId,
      teacherId
    });

    await newAnnouncement.save();

    // Notify all students in the class
    const classToNotify = await Class.findById(classId);
    if (classToNotify && classToNotify.students && classToNotify.students.length > 0) {
      const notifications = classToNotify.students
        .filter(studentId => studentId.toString() !== teacherId)
        .map(studentId => ({
          recipient: studentId,
          sender: teacherId,
          type: 'Announcement',
          content: `Your instructor posted a new announcement: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
          link: `/class/${classId}`
        }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.json(newAnnouncement);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Could not post the announcement. Please try again.' });
  }
};

exports.getAnnouncementsByClass = async (req, res) => {
  const classId = req.params.classId;

  try {
    const announcements = await Announcement.find({ classId })
      .sort({ createdAt: -1 })
      .populate('teacherId', 'name email')
      .populate('comments.userId', 'name email role')
      .populate('comments.replies.userId', 'name email role');
    res.json(announcements);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Could not load announcements. Please refresh the page.' });
  }
};

exports.addComment = async (req, res) => {
  const { announcementId, text } = req.body;
  const userId = req.user.id;

  try {
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) return res.status(404).json({ msg: 'Announcement not found' });

    announcement.comments.push({ text, userId });
    await announcement.save();

    const updated = await Announcement.findById(announcementId)
      .populate('teacherId', 'name email')
      .populate('comments.userId', 'name email role')
      .populate('comments.replies.userId', 'name email role');

    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Could not post your comment. Please try again.' });
  }
};

exports.addReply = async (req, res) => {
  const { announcementId, commentId, text } = req.body;
  const userId = req.user.id;

  try {
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) return res.status(404).json({ msg: 'Announcement not found' });

    const comment = announcement.comments.id(commentId);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });

    comment.replies.push({ text, userId });
    await announcement.save();

    const updated = await Announcement.findById(announcementId)
      .populate('teacherId', 'name email')
      .populate('comments.userId', 'name email role')
      .populate('comments.replies.userId', 'name email role');

    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Could not post your reply. Please try again.' });
  }
};

exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ msg: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Could not load the assignment. Please try again.' });
  }
};

exports.getAllUserAssignments = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  try {
    let assignments = [];
    if (role === 'Teacher') {
      const classes = await Class.find({ teacherId: userId });
      const classIds = classes.map(c => c._id);
      assignments = await Assignment.find({ classId: { $in: classIds } }).populate('classId', 'title subject');
    } else {
      const classes = await Class.find({ students: userId });
      const classIds = classes.map(c => c._id);
      assignments = await Assignment.find({ classId: { $in: classIds } }).populate('classId', 'title subject');
    }
    res.json(assignments);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Could not load your assignments. Please refresh the page.' });
  }
};

exports.giveFeedback = async (req, res) => {
  const { submissionId, feedback } = req.body;
  const teacherId = req.user.id;

  console.log(`[GIVE FEEDBACK] Attempting by Teacher: ${teacherId} for Submission: ${submissionId}`);

  try {
    const submission = await Submission.findById(submissionId).populate('assignmentId');
    if (!submission) {
       console.log('[GIVE FEEDBACK] Submission not found');
       return res.status(404).json({ msg: 'Submission not found' });
    }
    
    const classObj = await Class.findById(submission.classId);
    if (classObj.teacherId.toString() !== teacherId) {
      console.log(`[GIVE FEEDBACK] FAILED: Class Teacher ID (${classObj.teacherId}) !== Request User ID (${teacherId})`);
      return res.status(403).json({ msg: 'Access denied: You are not the teacher of this class' });
    }

    if (!submission.feedbacks) submission.feedbacks = [];
    if (submission.feedbacks.length >= 5) {
      return res.status(400).json({ msg: 'You can only provide up to 5 feedbacks per submission' });
    }

    submission.feedbacks.push({ text: feedback });
    submission.gradedAt = new Date();
    await submission.save();

    // Create Notification for the student
    const notification = new Notification({
      recipient: submission.studentId,
      sender: teacherId,
      type: 'Feedback',
      content: `Your teacher gave feedback on "${submission.assignmentId.title}"`,
      link: `/assignment/${submission.assignmentId._id}`
    });
    await notification.save();

    res.json(submission);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Could not save your feedback. Please try again.' });
  }
};

exports.getMySubmission = async (req, res) => {
  console.log('--- CHECKING SUBMISSION STATUS ---');
  console.log('Assignment ID:', req.params.assignmentId);
  console.log('Student ID:', req.user.id);
  try {
    const submission = await Submission.findOne({ 
      assignmentId: req.params.assignmentId, 
      studentId: req.user.id 
    });
    if (submission) {
      console.log(`--- STATUS: SUBMITTED (Found submission ID: ${submission._id} for Student: ${submission.studentId}) ---`);
    } else {
      console.log('--- STATUS: NOT SUBMITTED (Returning null) ---');
    }
    res.json(submission);
  } catch (err) {
    console.error('SERVER ERROR in getMySubmission:', err.message);
    res.status(500).json({ msg: 'Could not check your submission status. Please refresh the page.' });
  }
};
