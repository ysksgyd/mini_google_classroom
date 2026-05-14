const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const AssignmentSchema = new mongoose.Schema({
  title: String,
  classId: mongoose.Schema.Types.ObjectId,
});

const ClassSchema = new mongoose.Schema({
  title: String,
});

const Assignment = mongoose.model('Assignment', AssignmentSchema);
const Class = mongoose.model('Class', ClassSchema);

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const c = await mongoose.connection.db.collection('classes').findOne({ classCode: '11da02-d452' });
    if (c) {
      console.log(`Found Class: ${c.title} (${c._id})`);
      const assignments = await mongoose.connection.db.collection('assignments').find({ classId: c._id }).toArray();
      console.log(`Assignments: ${assignments.length}`);
      assignments.forEach(a => console.log(`  - ${a.title}`));
    } else {
      console.log('Class 11da02-d452 not found');
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

check();
