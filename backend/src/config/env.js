function getEnvConfig() {
    return {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 5000,
        mongoUri: process.env.MONGO_URI || '',
        jwtSecret: process.env.JWT_SECRET || 'devspace-local-jwt-secret'
    };
}

module.exports = {
    getEnvConfig
};
