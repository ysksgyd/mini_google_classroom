const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function fixDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Class = mongoose.model('Class', new mongoose.Schema({}, { strict: false }));

    // 1. Standardize Users
    const users = await User.find({});
    console.log(`Checking ${users.length} users...`);
    for (let user of users) {
      let updated = false;
      let newCourse = user.course;
      let newYear = user.year;

      if (user.course && user.course !== user.course.toUpperCase()) {
        newCourse = user.course.toUpperCase();
        updated = true;
      }
      
      if (user.year) {
        if (user.year === '1') { newYear = '1st Year'; updated = true; }
        if (user.year === '2') { newYear = '2nd Year'; updated = true; }
        if (user.year === '3') { newYear = '3rd Year'; updated = true; }
        if (user.year === '4') { newYear = '4th Year'; updated = true; }
        if (user.year === '3rd') { newYear = '3rd Year'; updated = true; }
        // etc if needed
      }

      if (updated) {
        await User.updateOne({ _id: user._id }, { course: newCourse, year: newYear });
        console.log(`Updated user ${user.email}: ${user.course}/${user.year} -> ${newCourse}/${newYear}`);
      }
    }

    // 2. Standardize Classes
    const classes = await Class.find({});
    console.log(`Checking ${classes.length} classes...`);
    for (let cls of classes) {
      let updated = false;
      let newCourse = cls.course;
      let newYear = cls.year;

      // Handle undefined course/year for old classes
      // If teacher exists, we might be able to pull from teacher, but teacher context is dynamic.
      // For now, let's just standardize what's there.
      
      if (cls.course && cls.course !== cls.course.toUpperCase()) {
        newCourse = cls.course.toUpperCase();
        updated = true;
      } else if (!cls.course) {
          // Default to BCA if missing? Or leave as is?
          // If it's missing, students with a course set will NEVER see it.
          // Let's at least set them to a default if they are active classes.
          // But which one? Better to leave them and fix manually or let teacher re-save.
      }

      if (cls.year) {
        if (cls.year === '1') { newYear = '1st Year'; updated = true; }
        if (cls.year === '2') { newYear = '2nd Year'; updated = true; }
        if (cls.year === '3') { newYear = '3rd Year'; updated = true; }
        if (cls.year === '4') { newYear = '4th Year'; updated = true; }
        if (cls.year === '3rd') { newYear = '3rd Year'; updated = true; }
      }

      if (updated) {
        await Class.updateOne({ _id: cls._id }, { course: newCourse, year: newYear });
        console.log(`Updated class ${cls.title}: ${cls.course}/${cls.year} -> ${newCourse}/${newYear}`);
      }
    }

    console.log('Done!');
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

fixDB();
