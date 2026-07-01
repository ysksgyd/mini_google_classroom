const Lesson = require('../models/Lesson');
const Class = require('../models/Class');
const Notification = require('../models/Notification');

exports.createLesson = async (req, res) => {
  const { title, description, classId } = req.body;
  const teacherId = req.user.id;

  try {
    const classToUpdate = await Class.findById(classId).populate('students', 'email');
    if (!classToUpdate) {
      return res.status(404).json({ msg: 'Class not found' });
    }

    if (classToUpdate.teacherId.toString() !== teacherId) {
      return res.status(403).json({ msg: 'Access denied: You are not the teacher of this class' });
    }

    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload a file for the lesson' });
    }

    // Determine file type
    const ext = req.file.originalname.split('.').pop().toLowerCase();
    let fileType = 'other';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) fileType = 'image';
    else if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) fileType = 'video';
    else if (ext === 'pdf') fileType = 'pdf';
    else if (['doc', 'docx'].includes(ext)) fileType = 'word';

    const newLesson = new Lesson({
      title,
      description,
      classId,
      teacherId,
      file: req.file.path.replace(/\\/g, '/'),
      fileType
    });

    await newLesson.save();

    // Notify students
    const notifications = classToUpdate.students.map(student => ({
      recipient: student._id,
      sender: teacherId,
      type: 'Lesson',
      content: `New lesson uploaded in ${classToUpdate.title}: ${title}`,
      link: `/class/${classId}/lessons`
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.json(newLesson);
  } catch (err) {
    console.error('Lesson creation error:', err.message);
    res.status(500).json({ msg: 'Could not upload the lesson. Please try again.' });
  }
};

exports.getAllUserLessons = async (req, res) => {
  const userId = req.user.id;
  try {
    let classes;
    if (req.user.role === 'Teacher') {
      classes = await Class.find({ teacherId: userId });
    } else {
      classes = await Class.find({ students: userId });
    }
    const classIds = classes.map(c => c._id);
    const lessons = await Lesson.find({ classId: { $in: classIds } }).sort({ createdAt: -1 }).populate('classId', 'title subject');
    res.json(lessons);
  } catch(err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getLessonsByClass = async (req, res) => {
  const { classId } = req.params;
  try {
    const lessons = await Lesson.find({ classId }).sort({ createdAt: -1 });
    res.json(lessons);
  } catch (err) {
    console.error('Fetch lessons error:', err.message);
    res.status(500).json({ msg: 'Could not load lessons. Please refresh the page.' });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ msg: 'Lesson not found' });

    if (lesson.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Lesson deleted successfully' });
  } catch (err) {
    console.error('Delete lesson error:', err.message);
    res.status(500).json({ msg: 'Could not delete the lesson. Please try again.' });
  }
};
