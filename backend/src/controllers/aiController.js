const { getEnvConfig } = require('../config/env');

function extractOpenAIText(data) {
    const content = data?.choices?.[0]?.message?.content;
    return typeof content === 'string' ? content.trim() : '';
}

function extractGeminiText(data) {
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const text = parts
        .map((part) => part?.text)
        .filter(Boolean)
        .join('\n')
        .trim();

    return text;
}

async function callOpenAI(prompt, apiKey) {
    const { openAiModel } = getEnvConfig();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: openAiModel,
            messages: [
                {
                    role: 'system',
                    content: 'You are a concise coding assistant. Explain and improve code clearly.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.2
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.error?.message || 'OpenAI request failed.');
    }

    const explanation = extractOpenAIText(data);

    if (!explanation) {
        throw new Error('OpenAI returned an empty response.');
    }

    return explanation;
}

async function callGemini(prompt, apiKey) {
    const { geminiModel } = getEnvConfig();
    const model = geminiModel;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: `You are a concise coding assistant. Explain and improve code clearly.\n\n${prompt}`
                        }
                    ]
                }
            ]
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.error?.message || 'Gemini request failed.');
    }

    const explanation = extractGeminiText(data);

    if (!explanation) {
        throw new Error('Gemini returned an empty response.');
    }

    return explanation;
}

async function explainCode(req, res, next) {
    try {
        const { prompt } = req.body;

        if (!prompt || typeof prompt !== 'string') {
            res.status(400);
            throw new Error('Prompt is required for AI explanation.');
        }

        const { aiProvider, aiApiKey, aiApiKeySecondary } = getEnvConfig();

        if (!aiProvider || !aiApiKey) {
            res.status(501);
            throw new Error('AI provider is not configured. Set AI_PROVIDER and AI_API_KEY in backend/.env.');
        }

        const provider = aiProvider.toLowerCase();
        let explanation = '';

        if (provider === 'openai') {
            explanation = await callOpenAI(prompt, aiApiKey);
        } else if (provider === 'gemini') {
            try {
                explanation = await callGemini(prompt, aiApiKey);
            } catch (primaryError) {
                if (!aiApiKeySecondary) {
                    throw primaryError;
                }

                explanation = await callGemini(prompt, aiApiKeySecondary);
            }
        } else {
            res.status(400);
            throw new Error('Unsupported AI provider. Use openai or gemini.');
        }

        res.status(200).json({
            provider,
            explanation
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    explainCode
};
