const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Class = require('../models/Class');
const { sendEmail } = require('./email');

const checkDeadlines = async () => {
    try {
        const now = new Date();
        // Find assignments where dueDate has passed and notification hasn't been sent
        const assignments = await Assignment.find({
            dueDate: { $lte: now },
            deadlineEmailSent: false
        });

        if (assignments.length === 0) return;

        console.log(`[SCHEDULE] Checking deadlines for ${assignments.length} assignments...`);

        for (const assignment of assignments) {
            const cls = await Class.findById(assignment.classId).populate('students', 'email name');
            if (!cls) {
                assignment.deadlineEmailSent = true;
                await assignment.save();
                continue;
            }

            const submissions = await Submission.find({ assignmentId: assignment._id });
            const submittedStudentIds = submissions.map(s => s.studentId.toString());

            const missingStudents = cls.students.filter(s => !submittedStudentIds.includes(s._id.toString()));

            if (missingStudents.length > 0) {
                const subject = `Deadline Passed: ${assignment.title}`;
                const text = `The deadline for assignment "${assignment.title}" has passed. Please submit your work if you haven't already.`;
                const html = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ff4d4f; border-radius: 10px;">
                        <h2 style="color: #ff4d4f;">Deadline Over</h2>
                        <p>The deadline for the assignment "<strong>${assignment.title}</strong>" in <strong>${cls.title}</strong> has passed.</p>
                        <p>Our records show that you have not submitted your work yet.</p>
                        <p>Please complete and submit it as soon as possible.</p>
                        <br>
                        <p>Best Regards,<br>Mini Google Classroom Team</p>
                    </div>
                `;

                const emails = missingStudents.map(s => s.email).filter(e => e).join(', ');
                if (emails) {
                    try {
                        await sendEmail({ to: emails, subject, text, html });
                    } catch (emailErr) {
                        console.error(`[DEADLINE EMAIL ERROR] for ${assignment.title}:`, emailErr.message);
                    }
                }
            }

            assignment.deadlineEmailSent = true;
            await assignment.save();
            console.log(`[DEADLINE] Notification processed for assignment: ${assignment.title}`);
        }
    } catch (err) {
        console.error('[DEADLINE SCHEDULER ERROR]', err);
    }
};

// Start the scheduler
exports.startDeadlineScheduler = () => {
    console.log('[DEADLINE] Scheduler started (Checking every 1 minute)');
    setInterval(checkDeadlines, 60000);
};
