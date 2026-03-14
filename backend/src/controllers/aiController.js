async function explainCode(req, res, next) {
    try {
        const { prompt } = req.body;

        if (!prompt || typeof prompt !== 'string') {
            res.status(400);
            throw new Error('Prompt is required for AI explanation.');
        }

        if (!process.env.AI_PROVIDER || !process.env.AI_API_KEY) {
            res.status(501);
            throw new Error('AI provider is not configured. Set AI_PROVIDER and AI_API_KEY in backend/.env.');
        }

        res.status(200).json({
            message: 'AI integration pending. Configure provider to enable responses.',
            prompt
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    explainCode
};
