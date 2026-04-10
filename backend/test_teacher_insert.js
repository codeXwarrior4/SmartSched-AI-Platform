(async () => {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({username: 'admin', password: 'password123'})
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    
    // Test creating teacher
    const teacherRes = await fetch('http://localhost:5000/api/teachers', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ name: 'Dr. John', email: 'john@fake.com', maxLecturesPerWeek: 20 })
    });
    
    console.log("Teacher creation status:", teacherRes.status);
    const text = await teacherRes.text();
    console.log("Payload:", text);
    
  } catch (e) {
    console.error(e);
  }
})();
