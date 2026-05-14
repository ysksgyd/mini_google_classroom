process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const API_URL = 'https://127.0.0.1:5000/api';

async function run() {
  try {
    const timestamp = Date.now();
    const teacherEmail = `teacher_${timestamp}@gmail.com`;
    const studentEmail = `student_${timestamp}@gmail.com`;
    const password = 'Password123';

    // 1. Register Teacher (2-step: start-register + verify-otp)
    console.log('Registering Teacher...');
    await fetch(`${API_URL}/auth/start-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Prof. Demo', email: teacherEmail, password, role: 'Teacher' })
    });
    const tVer = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Prof. Demo', email: teacherEmail, password, role: 'Teacher', otp: '999999', academicClass: '1st bca' })
    });
    const tData = await tVer.json();
    if (!tVer.ok) throw new Error('Teacher registration failed: ' + JSON.stringify(tData));
    const tToken = tData.token;

    // 2. Create Class
    console.log('Creating Class...');
    const cCre = await fetch(`${API_URL}/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tToken}` },
      body: JSON.stringify({ title: 'Full Stack Mastery', subject: 'Computer Science', description: 'Exploring MERN.' })
    });
    const cData = await cCre.json();
    if (!cCre.ok) throw new Error('Class creation failed: ' + JSON.stringify(cData));
    const classCode = cData.classCode;
    const classId = cData._id;

    // 3. Create Assignment
    console.log('Creating Assignment...');
    await fetch(`${API_URL}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tToken}` },
      body: JSON.stringify({ classId, title: 'Introduction to React', description: 'Build a hello world app.', dueDate: new Date().toISOString() })
    });

    // 4. Register Student (2-step)
    console.log('Registering Student...');
    await fetch(`${API_URL}/auth/start-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Student Demo', email: studentEmail, password, role: 'Student' })
    });
    const sVer = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Student Demo', email: studentEmail, password, role: 'Student', otp: '999999', academicClass: '1st bca' })
    });
    const sData = await sVer.json();
    if (!sVer.ok) throw new Error('Student registration failed: ' + JSON.stringify(sData));
    const sToken = sData.token;

    // 5. Join Class
    console.log('Joining Class...');
    await fetch(`${API_URL}/classes/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sToken}` },
      body: JSON.stringify({ classCode })
    });

    console.log('\n✅ SUCCESS');
    console.log(`Teacher: ${teacherEmail} / ${password}`);
    console.log(`Student: ${studentEmail} / ${password}`);
    console.log(`Class Code: ${classCode}`);

  } catch (err) {
    console.log('ERROR:', err.message);
  }
}

run();

