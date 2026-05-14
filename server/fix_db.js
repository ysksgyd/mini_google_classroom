const mongoose = require('mongoose');
const Lesson = require('./models/Lesson');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    // We are deleting the two accidental duplicates of "syllabus" ("know what is there in your syllabus")
    await Lesson.findByIdAndDelete('69ddc71ecba79fd6a493be6e');
    await Lesson.findByIdAndDelete('69ddc724cba79fd6a493be75');
    console.log("Deleted duplicate items.");
    process.exit(0);
  });
