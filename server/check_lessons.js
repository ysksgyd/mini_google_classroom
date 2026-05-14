const mongoose = require('mongoose');
const Lesson = require('./models/Lesson');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const lessons = await Lesson.find({});
    console.log(JSON.stringify(lessons, null, 2));
    process.exit(0);
  });
