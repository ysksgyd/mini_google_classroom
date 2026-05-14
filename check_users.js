const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server/.env') });

const UserSchema = new mongoose.Schema({
  email: String,
  role: String,
});

const User = mongoose.model('User', UserSchema);

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({});
    console.log('Total users:', users.length);
    users.forEach(u => console.log(`- ${u.email} (${u.role})`));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkUsers();
