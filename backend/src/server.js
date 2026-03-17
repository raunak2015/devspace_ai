const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDatabase = require('./config/db');
const { getEnvConfig } = require('./config/env');

const { port } = getEnvConfig();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Store io instance on the Express app so controllers can access it
app.set('io', io);

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a project-specific room
    socket.on('joinProject', (projectId) => {
        if (projectId) {
            socket.join(projectId);
            console.log(`Socket ${socket.id} joined room: ${projectId}`);
        }
    });

    // Leave a project-specific room
    socket.on('leaveProject', (projectId) => {
        if (projectId) {
            socket.leave(projectId);
            console.log(`Socket ${socket.id} left room: ${projectId}`);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

async function startServer() {
    try {
        await connectDatabase();

        server.listen(port, () => {
            console.log(`DevSpace backend listening on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start DevSpace backend:', error.message);
        process.exit(1);
    }
}

startServer();
