const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL/TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const mailOptions = {
  from: process.env.EMAIL_FROM,
  to: process.env.EMAIL_USER, // Send to self
  subject: 'SMTP Test',
  text: 'This is a test email from the server.'
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('SMTP TEST FAILED:', error.message);
  } else {
    console.log('SMTP TEST SUCCESS:', info.response);
  }
  process.exit();
});
