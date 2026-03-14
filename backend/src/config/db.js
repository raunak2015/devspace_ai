const mongoose = require('mongoose');

const { getEnvConfig } = require('./env');

async function connectDatabase() {
    const { mongoUri } = getEnvConfig();

    if (!mongoUri) {
        throw new Error('MONGO_URI is missing. Add it to backend/.env before starting the server.');
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
}

module.exports = connectDatabase;