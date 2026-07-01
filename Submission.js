const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  file: { type: String }, // Path for file upload
  text: { type: String }, // Optional text response
  submittedAt: { type: Date, default: Date.now },
  feedbacks: [{
    text: String,
    date: { type: Date, default: Date.now }
  }], // Teacher feedbacks (up to 5)
  gradedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
