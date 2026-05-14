const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Class = require('./models/Class');
  const Meeting = require('./models/Meeting');

  const classes = await Class.find({ students: '69da804b722c7af9b1cc149f' }).select('_id');
  console.log('Classes:', classes);
  const classIds = classes.map(c => c._id);
  const meetings = await Meeting.find({ classId: { $in: classIds } }).sort({ date: 1 }).populate('classId', 'title');
  console.log('Meetings for student mskgeetha@gmail.com:', meetings.length);
  process.exit(0);
});
