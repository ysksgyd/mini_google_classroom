process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const API_URL = 'https://localhost:5000/api';

async function testSubmit() {
  try {
    const timestamp = Date.now();
    const studentEmail = `student_${timestamp}@gmail.com`;
    const teacherEmail = `t_${timestamp}@gmail.com`;
    const password = 'Password123';

    // 1. Register Teacher
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
    if (!tVer.ok) throw new Error('Teacher Ver failed: ' + JSON.stringify(tData));
    const tToken = tData.token;

    // Create Class
    console.log('Creating Class...');
    const cCre = await fetch(`${API_URL}/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tToken}` },
      body: JSON.stringify({ title: 'Test Class', subject: 'CS', description: 'Testing' })
    });
    const cData = await cCre.json();
    if (!cCre.ok) throw new Error('Class Cre failed: ' + JSON.stringify(cData));
    const classId = cData._id;
    const classCode = cData.classCode;

    // Create Assignment
    console.log('Creating Assignment...');
    const aCre = await fetch(`${API_URL}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tToken}` },
        body: JSON.stringify({ classId, title: 'Test Assignment', description: 'Test', dueDate: new Date().toISOString() })
    });
    const aData = await aCre.json();
    if (!aCre.ok) throw new Error('Assignment Cre failed: ' + JSON.stringify(aData));
    const assignmentId = aData._id;

    // Register Student
    console.log('Registering Student...');
    await fetch(`${API_URL}/auth/start-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Student Test', email: studentEmail, password, role: 'Student' })
    });
    const sVer = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Student Test', email: studentEmail, password, role: 'Student', otp: '999999', academicClass: '1st bca' })
    });
    const sData = await sVer.json();
    if (!sVer.ok) throw new Error('Student Ver failed: ' + JSON.stringify(sData));
    const sToken = sData.token;

    // Join Class
    console.log('Joining Class...');
    const jRes = await fetch(`${API_URL}/classes/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sToken}` },
        body: JSON.stringify({ classCode })
    });
    if (!jRes.ok) throw new Error('Join Class failed: ' + await jRes.text());

    // Test Submission
    console.log('Testing assignment submission...');
    const formData = new FormData();
    formData.append('assignmentId', assignmentId);
    formData.append('classId', classId);
    formData.append('text', 'My Submission');
    
    // Note: We are NOT appending a file here to see if it works without one, or we could append a dummy file.
    // The server uses upload.single('file'), so it expects a field named 'file'.
    
    const subRes = await fetch(`${API_URL}/assignments/submit`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${sToken}`
            // Content-Type will be set automatically with boundary for FormData
        },
        body: formData
    });
    
    const subData = await subRes.json();
    if (!subRes.ok) throw new Error(JSON.stringify(subData));
    console.log('SUBMISSION SUCCESS');

  } catch (err) {
    console.error('SUBMISSION FAILED:', err.message);
  }
}

testSubmit();
