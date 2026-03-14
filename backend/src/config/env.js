function getEnvConfig() {
    return {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 5000,
        mongoUri: process.env.MONGO_URI || '',
        jwtSecret: process.env.JWT_SECRET || 'devspace-local-jwt-secret',
        aiProvider: process.env.AI_PROVIDER || '',
        aiApiKey: process.env.AI_API_KEY || '',
        aiApiKeySecondary: process.env.AI_API_KEY_SECONDARY || '',
        openAiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
    };
}

module.exports = {
    getEnvConfig
};
