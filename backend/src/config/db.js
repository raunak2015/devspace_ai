const mongoose = require('mongoose');
const dns = require('dns');

// Use Google DNS to resolve MongoDB Atlas SRV records
// (bypasses local DNS that may block SRV lookups)
dns.setServers(['8.8.8.8', '8.8.4.4']);

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