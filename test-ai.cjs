const http = require('http');

const baseURL = 'http://localhost:5000/api';

async function fetchJSON(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(baseURL + path, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runTest() {
  const testEmail = process.argv[2];
  const testPassword = 'Password123';
  
  if (!testEmail) {
    console.error('Email required as argument');
    process.exit(1);
  }

  const regRes = await fetchJSON('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword })
  });
  
  if (!regRes.data.token) {
    console.error('Login failed:', regRes.data);
    process.exit(1);
  }
  let token = regRes.data.token;
  
  console.log('--- Calling AI API ---');
  const aiRes = await fetchJSON('/ai/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ prompt: 'Write a for loop in JavaScript' })
  });
  
  console.log('Status:', aiRes.status);
  console.log('Response:', aiRes.data);
}

runTest().catch(console.error);
