const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Teacher', 'Student'], default: 'Student' },
  course: { type: String },
  year: { type: String },
  courseCode: { type: String },
  isCourseVerified: { type: Boolean, default: false },
  profilePicture: { type: String },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
