const mongoose = require('mongoose');
const User = require('./src/models/User');
const { getEnvConfig } = require('./src/config/env');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function createVerifiedUser() {
  const { mongoUri } = getEnvConfig();
  await mongoose.connect(mongoUri);

  const email = `testuser_${Date.now()}@test.com`;
  const password = process.argv[2] || 'Password123';

  // Create a user that is ALREADY verified
  const user = await User.create({
      name: 'Test Socket User',
      email: email,
      password: password,
      isVerified: true
  });

  console.log(`__TEST_USER_CREATED__${email}__`);
  process.exit(0);
}

createVerifiedUser().catch(console.error);
