function getEnvConfig() {
    return {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 5000,
        mongoUri: process.env.MONGO_URI || ''
    };
}

module.exports = {
    getEnvConfig
};
