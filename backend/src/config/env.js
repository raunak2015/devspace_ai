function getEnvConfig() {
    return {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 5000,
        mongoUri: process.env.MONGO_URI || '',
        jwtSecret: process.env.JWT_SECRET || 'devspace-local-jwt-secret',
        aiProvider: process.env.AI_PROVIDER || '',
        aiApiKey: process.env.AI_API_KEY || '',
        aiApiKeySecondary: process.env.AI_API_KEY_SECONDARY || '',
        openAiApiKey: process.env.OPENAI_API_KEY || '',
        openAiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
        emailService: process.env.EMAIL_SERVICE || 'gmail',
        emailUser: process.env.EMAIL_USER || '',
        emailPass: process.env.EMAIL_PASS || ''
    };
}

module.exports = {
    getEnvConfig
};
