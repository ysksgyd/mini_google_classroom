const Class = require('../models/Class');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Announcement = require('../models/Announcement');
const User = require('../models/User');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Build a comprehensive system prompt with full app knowledge
const buildSystemPrompt = (user, liveData) => {
  const { classes, assignments, submissions, announcements } = liveData;

  // Format live data as readable context
  let classContext = 'No classes found.';
  if (classes.length > 0) {
    classContext = classes.map((c, i) => {
      const classAssignments = assignments.filter(a => a.classId?.toString() === c._id?.toString() || a.classId?._id?.toString() === c._id?.toString());
      const studentCount = c.students?.length || 0;
      return `${i + 1}. "${c.title}" (Subject: ${c.subject}) — Code: ${c.classCode}, ${studentCount} student(s), ${classAssignments.length} assignment(s)${c.description ? `, Description: ${c.description}` : ''}`;
    }).join('\n');
  }

  let assignmentContext = 'No assignments found.';
  if (assignments.length > 0) {
    assignmentContext = assignments.map((a, i) => {
      const dueDate = new Date(a.dueDate);
      const now = new Date();
      const isOverdue = dueDate < now;
      const className = a.classId?.title || 'Unknown Class';
      const submissionCount = submissions.filter(s => s.assignmentId?.toString() === a._id?.toString()).length;
      return `${i + 1}. "${a.title}" in "${className}" — Due: ${dueDate.toLocaleDateString()} ${isOverdue ? '[OVERDUE]' : '[upcoming]'}, ${submissionCount} submission(s)${a.description ? `, Description: ${a.description}` : ''}${a.file ? ', Has attached file' : ''}`;
    }).join('\n');
  }

  let submissionContext = 'No submissions found.';
  if (submissions.length > 0) {
    submissionContext = submissions.map((s, i) => {
      const assignTitle = s.assignmentId?.title || 'Unknown Assignment';
      const studentName = s.studentId?.name || 'Unknown Student';
      const submittedAt = new Date(s.submittedAt || s.createdAt).toLocaleDateString();
      return `${i + 1}. "${assignTitle}" by ${studentName} — Submitted: ${submittedAt}${s.feedbacks?.length ? `, ${s.feedbacks.length} feedback(s) given` : ', No feedback yet'}${s.file ? ', Has file' : ''}${s.text ? `, Response: "${s.text.substring(0, 100)}..."` : ''}`;
    }).join('\n');
  }

  let announcementContext = 'No announcements.';
  if (announcements.length > 0) {
    announcementContext = announcements.slice(0, 10).map((ann, i) => {
      return `${i + 1}. "${ann.text?.substring(0, 100)}${ann.text?.length > 100 ? '...' : ''}" — Posted: ${new Date(ann.createdAt).toLocaleDateString()}, ${ann.comments?.length || 0} comment(s)`;
    }).join('\n');
  }

  return `You are "Classroom Assistant", the built-in AI help bot for Mini Google Classroom — a learning management system. Your job is to answer questions accurately about this specific app and the user's own data. Be friendly, concise, and use emojis occasionally.

=== CURRENT USER ===
Name: ${user.name}
Email: ${user.email}
Role: ${user.role} ${user.course ? `| Course: ${user.course}` : ''} ${user.year ? `| Year: ${user.year}` : ''}

=== USER'S LIVE DATA (Always reference this first when asked about their classes, assignments, etc.) ===

CLASSES (${classes.length} total):
${classContext}

ASSIGNMENTS (${assignments.length} total):
${assignmentContext}

SUBMISSIONS (${submissions.length} total):
${submissionContext}

RECENT ANNOUNCEMENTS (${announcements.length} total):
${announcementContext}

=== APP KNOWLEDGE BASE ===

## REGISTRATION & LOGIN
- Only @gmail.com email addresses are accepted
- Two-step registration: fill form → receive OTP on Gmail → enter OTP to create account
- Students must select their Course (e.g. BCA) and Year (e.g. 3rd Year) during registration
- JWT tokens expire after 1 day — if a page stops loading, re-login

## DASHBOARD (Home Page)
- Shows all classes the user belongs to as cards
- Teachers see a "Create Class" button; Students see a "Join a Class" button
- Each class card shows: class title, subject, teacher name, and class code (for teachers)
- Three-dot menu (⋮) on a card → "Delete Class" option (teachers only)

## CLASS VIEW — 3 TABS: Stream, Classwork, People
Clicking a class card opens the class with three tabs at the top.

### Stream Tab
- Shows the class title banner and upcoming deadlines sidebar
- "Class Announcements": This section shows the class code (for teachers)
- "Broadcast History": A dropdown menu that lists all previous class announcements
- Teachers can post announcements (text broadcasts to all students)
- Students receive a notification (bell icon) when a new announcement is posted
- All users (teachers + students) can comment on announcements

### Classwork Tab
- Lists all assignments for the class
- Teachers see an "Initialize Task" button to create new assignments
- Create Assignment form fields: Task Title, Sub title (description), Deadline (date picker)

### People Tab
- Shows a "Class Roster" banner with the TOTAL number of members
- Lists lead instructors and enrolled classmates

## REAL-TIME MESSAGING (Messages Page)
- Users can have private 1-on-1 chats with teachers or classmates
- Works in REAL-TIME: messages appear as soon as they are sent
- Accessible from "Messages" in the sidebar
- Options in the 3-dots menu inside a chat: "Clear History" and "Close Chat"

## NOTIFICATIONS (Bell icon in navbar)
- Users get notified when: a new announcement is posted, a new assignment is created, teacher gives feedback, or a private message is received

## TROUBLESHOOTING
- "Account Verification": If you see this, you need to verify your course details to continue
- "All Caught Up!": This means you have no pending assignments
- "No classes yet": You haven't joined or created any classes for the selected academic session

=== RESPONSE RULES ===
1. DIRECT ANSWERS ONLY: Never start with "As an AI..." or refuse to answer a question about the classroom.
2. DATA PRIORITY: If asked about your classes or tasks, count them from the LIVE DATA provided above and list them clearly.
3. STEP-BY-STEP: When explaining how to join, create, or submit, provide a numbered list of exact steps.
4. NEVER BE VAGUE: Instead of saying "You can join a class," say "Click the 'Join a Class' button on your dashboard and enter the 6-character code."
5. BE AN EXPERT: You know every corner of this app. Use that knowledge to guide the user perfectly.
6. MENTION RECENT FEATURES: If relevant, mention the real-time "Messages" section or the "Broadcast History" in the class Stream.
7. ROLE CONTEXT: You are talking to a ${user.role}. Focus on actions they can actually perform.`;
};


exports.chat = async (req, res) => {
  const { message, conversationHistory = [] } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ msg: 'Message is required' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ msg: 'Chatbot API key not configured. Add GROQ_API_KEY to your .env file.' });
  }

  try {
    // Fetch live data for the current user
    const userId = req.user.id;
    const userRole = req.user.role;

    let classes = [];
    if (userRole === 'Teacher') {
      classes = await Class.find({ teacherId: userId }).populate('students', 'name email');
    } else {
      classes = await Class.find({ students: userId }).populate('teacherId', 'name email');
    }

    const classIds = classes.map(c => c._id);

    const assignments = await Assignment.find({ classId: { $in: classIds } })
      .populate('classId', 'title subject');

    const assignmentIds = assignments.map(a => a._id);

    let submissions = [];
    if (userRole === 'Teacher') {
      submissions = await Submission.find({ assignmentId: { $in: assignmentIds } })
        .populate('studentId', 'name email')
        .populate('assignmentId', 'title');
    } else {
      submissions = await Submission.find({ studentId: userId, assignmentId: { $in: assignmentIds } })
        .populate('assignmentId', 'title');
    }

    const announcements = await Announcement.find({ classId: { $in: classIds } })
      .sort({ createdAt: -1 })
      .limit(10);

    const liveData = { classes, assignments, submissions, announcements };
    const systemPrompt = buildSystemPrompt(req.user, liveData);

    // Build messages array for the API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10).map(m => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.text
      })),
      { role: 'user', content: message }
    ];

    // Call Groq API directly
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error status:', response.status);
      console.error('Groq API error body:', errorText);
      return res.status(502).json({ msg: 'Failed to get response from AI service.' });
    }

    const data = await response.json();
    const botReply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

    res.json({ reply: botReply });
  } catch (err) {
    console.error('Chatbot error:', err.message);
    require('fs').appendFileSync('chatbot_debug.log', `[${new Date().toISOString()}] Error: ${err.message}\nStack: ${err.stack}\n\n`);
    res.status(500).json({ msg: 'The assistant is temporarily unavailable. Please try again in a moment.', error: err.message });
  }
};
