const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Could not load notifications. Please refresh the page.' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ msg: 'Notification not found' });
    
    if (notification.recipient.toString() !== req.user.id) {
       return res.status(403).json({ msg: 'Unauthorized' });
    }

    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Could not update the notification. Please try again.' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id }, { isRead: true });
    res.json({ msg: 'All notifications marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Could not mark notifications as read. Please try again.' });
  }
};

exports.deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });
    res.json({ msg: 'All notifications cleared' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Could not clear notifications. Please try again.' });
  }
};
