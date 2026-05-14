const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const fs = require('fs');
const path = require('path');

const sendEmail = async (options) => {
  fs.appendFileSync('email_debug.log', `[${new Date().toISOString()}] ATTEMPT: Sending to ${options.to} (Subject: ${options.subject})\n`);
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    fs.appendFileSync('email_debug.log', `[${new Date().toISOString()}] SUCCESS: Sent to ${options.to}. MessageId: ${info.messageId}\n`);
    return info;
  } catch (error) {
    fs.appendFileSync('email_debug.log', `[${new Date().toISOString()}] FAILED: To ${options.to}. Error: ${error.message}\n`);
    console.error('SMTP Error:', error.message);
    throw error;
  }
};

exports.sendEmail = sendEmail;


exports.sendRegistrationEmail = async (user) => {
  const subject = 'Welcome to Mini Google Classroom';
  let courseCodeHtml = '';
  if (user.role === 'Student' && user.courseCode) {
    courseCodeHtml = `
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px dashed #4285F4; margin: 20px 0; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase; font-weight: bold;">Your Unique Course Code</p>
        <p style="margin: 10px 0 0 0; font-size: 20px; color: #4285F4; font-weight: bold; letter-spacing: 2px;">${user.courseCode}</p>
        <p style="margin: 5px 0 0 0; font-size: 11px; color: #888;">Save this code! You will need it for verification.</p>
      </div>
    `;
  }

  const text = `Hi ${user.name},\n\nThank you for registering at Mini Google Classroom. ${user.courseCode ? `Your course code is: ${user.courseCode}` : ''}\n\nWe are glad to have you!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #4285F4;">Welcome to Mini Google Classroom</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Thank you for registering at Mini Google Classroom. We are glad to have you!</p>
      ${courseCodeHtml}
      <p>You can now join classes, submit assignments, and stay organized.</p>
      <br>
      <p>Best Regards,<br>Mini Google Classroom Team</p>
    </div>
  `;

  await sendEmail({ to: user.email, subject, text, html });
};

exports.sendAssignmentEmail = async (students, assignment, className) => {
  const subject = `New Assignment Posted in ${className}: ${assignment.title}`;
  const text = `A new assignment "${assignment.title}" has been posted in ${className}. Due date: ${new Date(assignment.dueDate).toLocaleDateString()}.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #4285F4;">New Assignment Posted</h2>
      <p>A new assignment "<strong>${assignment.title}</strong>" has been posted in <strong>${className}</strong>.</p>
      <p><strong>Description:</strong> ${assignment.description}</p>
      <p><strong>Due Date:</strong> ${new Date(assignment.dueDate).toLocaleDateString()}</p>
      <br>
      <a href="${process.env.CLIENT_URL || 'https://localhost:5173'}/assignment/${assignment._id}" 
         style="background-color: #4285F4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
         View Assignment
      </a>
      <br><br>
      <p>Best Regards,<br>Mini Google Classroom Team</p>
    </div>
  `;

  const studentEmails = students.map(s => s.email).filter(e => e).join(', ');
  
  if (studentEmails) {
    await sendEmail({ to: studentEmails, subject, text, html });
  }
};

exports.sendSubmissionConfirmationEmail = async (studentEmail, assignmentTitle, studentName) => {
  const subject = `Assignment Received: ${assignmentTitle}`;
  const text = `Hi ${studentName},\n\nYour assignment "${assignmentTitle}" has been received successfully.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #4285F4;">Assignment Received</h2>
      <p>Hi <strong>${studentName}</strong>,</p>
      <p>Your assignment "<strong>${assignmentTitle}</strong>" has been received successfully!</p>
      <p>Our teacher will review it and provide feedback soon.</p>
      <br>
      <p>Best Regards,<br>Mini Google Classroom Team</p>
    </div>
  `;

  await sendEmail({ to: studentEmail, subject, text, html });
};

exports.sendOTPEmail = async (email, otp) => {
  const subject = 'Your One-Time Password (OTP) for Registration';
  const text = `Your OTP for registration is: ${otp}. It will expire in 10 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #4285F4;">Account Verification</h2>
      <p>Hi,</p>
      <p>Your One-Time Password (OTP) for registering with Mini Google Classroom is:</p>
      <div style="background-color: #f4f4f4; padding: 20px; font-size: 24px; font-weight: black; text-align: center; border-radius: 10px; color: #4285F4; border: 2px solid #4285F4; letter-spacing: 12px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This OTP will expire in <strong>10 minutes</strong>.</p>
      <p>If you did not request this OTP, please ignore this email.</p>
      <br>
      <p>Best Regards,<br>Mini Google Classroom Team</p>
    </div>
  `;

  await sendEmail({ to: email, subject, text, html });
};

exports.sendMeetingEmail = async (students, meeting, className) => {
  const studentEmails = students.map(s => s.email).filter(e => e).join(', ');
  
  if (studentEmails) {
    await sendEmail({ 
      to: studentEmails, 
      subject: `New Online Class Scheduled for ${className}: ${meeting.title}`, 
      text: `You have a new online class scheduled: "${meeting.title}" on ${new Date(meeting.date).toLocaleString()}. Join here: ${meeting.meetingLink}`, 
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4285F4;">New Online Class Scheduled</h2>
          <p>A new online meeting "<strong>${meeting.title}</strong>" has been arranged for <strong>${className}</strong>.</p>
          <p><strong>Description:</strong> ${meeting.description || 'No description provided.'}</p>
          <p><strong>Date & Time:</strong> ${new Date(meeting.date).toLocaleString()}</p>
          <br>
          <a href="${meeting.meetingLink}" 
             style="background-color: #34A853; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
             Join Online Class
          </a>
          <br><br>
          <p>We look forward to seeing you there!</p>
          <p>Best Regards,<br>Mini Google Classroom Team</p>
        </div>
      ` 
    });
  }
};


