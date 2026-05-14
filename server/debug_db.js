const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  course: String,
  year: String,
  courseCode: String,
  isCourseVerified: Boolean
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({});
    console.log('Total users:', users.length);
    users.forEach(u => {
      console.log(`- ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, Course: ${u.course}, Year: ${u.year}`);
    });
    
    const ClassSchema = new mongoose.Schema({}, { strict: false });
    const Class = mongoose.models.Class || mongoose.model('Class', ClassSchema);
    
    const classes = await Class.find({});
    console.log('\nTotal classes:', classes.length);
    classes.forEach(c => {
        console.log(`- ID: ${c._id}, Class: ${c.title}, Course: ${c.course}, Year: ${c.year}, Students: ${JSON.stringify(c.students)}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkUsers();
