const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Send a personal message (handles both text and files)
exports.sendMessage = async (req, res) => {
  const { recipientId, text, classId } = req.body;
  const myId = req.user.id || req.user._id;

  try {
    const message = await Message.create({
      sender: myId,
      recipient: recipientId,
      text: text || "",
      file: req.file ? `uploads/${req.file.filename}` : undefined,
      fileName: req.file ? req.file.originalname : undefined,
      fileType: req.file ? req.file.mimetype : undefined,
      classId
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', '_id name')
      .populate('recipient', '_id name');

    const io = req.app.get('socketio');
    if (io) {
      io.to(recipientId).to(myId).emit('new_message', populatedMessage);
    }

    const notification = new Notification({
      recipient: recipientId,
      sender: myId,
      type: 'Message',
      content: `${req.user.name} sent you a message`,
      link: `/messages?userId=${myId}`
    });
    await notification.save();

    res.json(populatedMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Could not send message' });
  }
};

// Get personal chat between current user and another user
exports.getChat = async (req, res) => {
  const myId = req.user.id || req.user._id;
  const otherUserId = req.params.otherUserId;

  try {
    const messages = await Message.find({
      $or: [
        { sender: myId, recipient: otherUserId },
        { sender: otherUserId, recipient: myId }
      ]
    })
    .populate("sender", "_id name")
    .populate("recipient", "_id name")
    .sort({ createdAt: 1 });

    console.log("FETCHED MESSAGES:", messages);
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Could not load chat' });
  }
};

// Get list of users the current user has chatted with, including the last message
exports.getConversations = async (req, res) => {
  const userId = req.user.id;
  try {
    // Find last message for each conversation
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    }).sort({ createdAt: -1 });

    const contactMap = new Map();
    messages.forEach(m => {
      const otherId = m.sender.toString() === userId ? m.recipient.toString() : m.sender.toString();
      if (!contactMap.has(otherId)) {
        contactMap.set(otherId, {
          lastMessage: m.text,
          lastMessageDate: m.createdAt,
          otherId
        });
      }
    });

    const contactIds = Array.from(contactMap.keys());
    const users = await User.find({ _id: { $in: contactIds } }, 'name email profilePicture role');
    
    const conversations = users.map(user => {
      const info = contactMap.get(user._id.toString());
      return {
        ...user._doc,
        lastMessage: info.lastMessage,
        lastMessageDate: info.lastMessageDate
      };
    }).sort((a, b) => b.lastMessageDate - a.lastMessageDate);

    res.json(conversations);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Could not load conversations' });
  }
};

// Get all people in the same classes as the user (Teachers and Classmates)
exports.getAvailableContacts = async (req, res) => {
  const userId = req.user.id;
  const { course, year } = req.user;
  try {
    const Class = require('../models/Class');
    const classes = await Class.find({
      $or: [{ students: userId }, { teacherId: userId }],
      course,
      year
    }).populate('students', 'name email profilePicture role')
      .populate('teacherId', 'name email profilePicture role');

    const contactMap = new Map();
    classes.forEach(c => {
      if (c.teacherId && c.teacherId._id.toString() !== userId) {
        contactMap.set(c.teacherId._id.toString(), c.teacherId);
      }
      if (c.students) {
        c.students.forEach(s => {
          if (s._id.toString() !== userId) {
            contactMap.set(s._id.toString(), s);
          }
        });
      }
    });

    res.json(Array.from(contactMap.values()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Could not fetch available contacts' });
  }
};

// Clear all messages between current user and another user
exports.clearConversation = async (req, res) => {
  const userId = req.user.id;
  const otherUserId = req.params.otherUserId;

  try {
    await Message.deleteMany({
      $or: [
        { sender: userId, recipient: otherUserId },
        { sender: otherUserId, recipient: userId }
      ]
    });

    res.json({ msg: 'Conversation cleared successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Failed to clear conversation' });
  }
};
