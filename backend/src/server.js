const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');
const connectDatabase = require('./config/db');
const { getEnvConfig } = require('./config/env');

const { port } = getEnvConfig();

async function startServer() {
    try {
        await connectDatabase();

        app.listen(port, () => {
            console.log(`DevSpace backend listening on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start DevSpace backend:', error.message);
        process.exit(1);
    }
}

startServer();
