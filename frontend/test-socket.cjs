const io = require('socket.io-client');
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
  console.log('--- Starting Socket.io Test ---');
  
  const testEmail = process.argv[2];
  const testPassword = 'Password123';
  
  if (!testEmail) {
    console.error('Email required as argument');
    process.exit(1);
  }

  // 1. Login User
  console.log(`1. Logging in user ${testEmail}...`);
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
  
  // 2. Create Project
  console.log('2. Creating test project...');
  const projRes = await fetchJSON('/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ name: 'Socket Test Project', owner: 'testuser' })
  });
  if (!projRes.data.project) {
    console.error('Project creation failed:', projRes.data);
    process.exit(1);
  }
  const projectId = projRes.data.project._id;
  
  // 3. Connect Socket
  console.log(`3. Connecting Socket client to project room: ${projectId}`);
  const socket = io('http://localhost:5000', { transports: ['websocket'] });
  
  let eventsReceived = [];

  socket.on('connect', () => {
    socket.emit('joinProject', projectId);
    
    // 4. Send Message via HTTP
    setTimeout(async () => {
      console.log('4. Sending message via HTTP...');
      await fetchJSON('/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ projectId, message: 'Hello WebSockets!' })
      });
    }, 1000);
  });

  socket.on('newMessage', async (msg) => {
    console.log('✅ Received newMessage event:', msg.message);
    eventsReceived.push('newMessage');
    
    // 5. Delete Message via HTTP
    console.log('5. Deleting message via HTTP...');
    await fetchJSON(`/messages/${msg._id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  });

  socket.on('messageDeleted', (msgId) => {
    console.log('✅ Received messageDeleted event for ID:', msgId);
    eventsReceived.push('messageDeleted');
    
    console.log('--- Test Completed Successfully! ---');
    socket.disconnect();
    process.exit(0);
  });
  
  setTimeout(() => {
    console.error('❌ Test timed out!');
    process.exit(1);
  }, 10000);
}

runTest().catch(console.error);
