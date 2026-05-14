process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const API_URL = 'https://localhost:5000/api';

async function seed() {
  const email = `teacher_${Date.now()}@gmail.com`;
  const password = 'Password123';
  try {
    // 1. Register Teacher (2-step)
    console.log(`Registering teacher: ${email}...`);
    await fetch(`${API_URL}/auth/start-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Demo Teacher', email, password, role: 'Teacher' })
    });
    const verRes = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Demo Teacher', email, password, role: 'Teacher', otp: '999999', academicClass: '1st bca' })
    });
    const teacherData = await verRes.json();
    if (!verRes.ok) throw new Error(JSON.stringify(teacherData));
    const token = teacherData.token;
    console.log('Teacher registered.');

    // 2. Create Class
    console.log('Creating class...');
    const classRes = await fetch(`${API_URL}/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title: 'Full Stack Mastery', subject: 'MERN Stack Development', description: 'Learn everything from scratch' })
    });
    const classData = await classRes.json();
    if (!classRes.ok) throw new Error(JSON.stringify(classData));
    const classCode = classData.classCode;
    console.log('Class created! Code:', classCode);

    // 3. Create Assignment
    console.log('Creating assignment...');
    const assignmentRes = await fetch(`${API_URL}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        classId: classData._id,
        title: 'Introduction to HTML',
        description: 'Complete the basic HTML structure exercise.',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    });
    const assignmentData = await assignmentRes.json();
    if (!assignmentRes.ok) throw new Error(JSON.stringify(assignmentData));
    console.log('Assignment created!');

    console.log('\n✅ Seeding completed successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Class Code: ${classCode}`);

  } catch (err) {
    console.error('Seeding failed:', err.message);
  }
}

seed();
