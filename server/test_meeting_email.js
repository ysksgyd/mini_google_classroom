const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const Class = require('./models/Class');
const Meeting = require('./models/Meeting');
const User = require('./models/User');
const { sendMeetingEmail } = require('./utils/email');

async function testMeetingEmail() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find the class with a student
    const cls = await Class.findOne({ title: 'security' }).populate('students');
    if (!cls) {
      console.log('Class not found');
      return;
    }
    
    console.log(`Testing for class: ${cls.title}`);
    console.log(`Number of students: ${cls.students.length}`);
    
    const mockMeeting = {
      title: 'TEST MEETING',
      description: 'Test Description',
      date: new Date(),
      meetingLink: 'https://meet.google.com/test-abc-def'
    };
    
    console.log('Calling sendMeetingEmail...');
    await sendMeetingEmail(cls.students, mockMeeting, cls.title);
    console.log('Finished calling sendMeetingEmail');
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Test Error:', err);
  }
}

testMeetingEmail();
