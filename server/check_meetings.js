const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const Class = require('./models/Class');
const Meeting = require('./models/Meeting');
const User = require('./models/User');

async function checkMeetings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const meetings = await Meeting.find({}).populate('classId');
    console.log('Total meetings:', meetings.length);
    
    for (const m of meetings) {
      const cls = await Class.findById(m.classId).populate('students');
      console.log(`Meeting: ${m.title} (Created: ${m.createdAt})`);

      console.log(`- Class: ${cls ? cls.title : 'N/A'}`);
      console.log(`- Students in class: ${cls ? cls.students.length : 0}`);
      if (cls && cls.students.length > 0) {
        cls.students.forEach(s => console.log(`  - Student: ${s.email}`));
      }
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkMeetings();
