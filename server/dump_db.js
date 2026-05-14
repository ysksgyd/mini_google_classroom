const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Class = require('./models/Class');
const Meeting = require('./models/Meeting');
const User = require('./models/User');

dotenv.config({ path: './.env' });

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find();
    console.log(`Users: ${users.length}`);
    users.forEach(u => console.log(`- ${u.name} (${u.role}) [${u.email}] ID: ${u._id}`));

    const classes = await Class.find().populate('students');
    console.log(`Classes: ${classes.length}`);
    classes.forEach(c => {
      console.log(`- ${c.title} (Code: ${c.classCode}) Students count: ${c.students.length}`);
      c.students.forEach(s => console.log(`    - Student: ${s.name} (${s._id})`));
    });

    const meetings = await Meeting.find().populate('classId');
    console.log(`Meetings: ${meetings.length}`);
    meetings.forEach(m => {
      console.log(`- ${m.title} (Class: ${m.classId ? m.classId.title : 'N/A'}) Date: ${m.date}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

check();
