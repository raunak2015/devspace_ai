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

function isGeminiQuotaError(message) {
    return /quota exceeded|rate limit|free_tier_requests|free_tier_input_token_count/i.test(String(message || ''));
}

function isOpenAIQuotaError(message) {
    return /quota|rate limit|insufficient_quota|billing details/i.test(String(message || ''));
}

function isGroqQuotaError(message) {
    return /rate limit|quota|limit reached/i.test(String(message || ''));
}

function extractRetryAfterSeconds(message) {
    const match = String(message || '').match(/retry in\s+([0-9]+(?:\.[0-9]+)?)s/i);
    if (!match) {
        return null;
    }

    return Math.ceil(Number.parseFloat(match[1]));
}

function normalizeGeminiModelName(modelName) {
    return String(modelName || '').replace(/^models\//, '');
}

function buildGeminiGenerateUrl(modelName, apiKey) {
    const normalizedModel = normalizeGeminiModelName(modelName);
    return `https://generativelanguage.googleapis.com/v1beta/models/${normalizedModel}:generateContent?key=${apiKey}`;
}

async function findFallbackGeminiModel(apiKey) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.error?.message || 'Unable to list Gemini models.');
    }

    const models = Array.isArray(data?.models) ? data.models : [];
    const preferred = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];

    for (const candidate of preferred) {
        const found = models.find((model) => {
            const name = normalizeGeminiModelName(model?.name);
            const methods = model?.supportedGenerationMethods || [];
            return name === candidate && methods.includes('generateContent');
        });

        if (found) {
            return normalizeGeminiModelName(found.name);
        }
    }

    const firstSupported = models.find((model) => {
        const methods = model?.supportedGenerationMethods || [];
        return methods.includes('generateContent');
    });

    if (!firstSupported) {
        throw new Error('No Gemini model supporting generateContent was found for this API key.');
    }

    return normalizeGeminiModelName(firstSupported.name);
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
        const message = data?.error?.message || 'OpenAI request failed.';
        const error = new Error(message);
        error.statusCode = response.status;
        error.isOpenAIQuotaError = isOpenAIQuotaError(message);
        throw error;
    }

    const explanation = extractOpenAIText(data);

    if (!explanation) {
        throw new Error('OpenAI returned an empty response.');
    }

    return explanation;
}

async function callGemini(prompt, apiKey) {
    const { geminiModel } = getEnvConfig();
    const configuredModel = normalizeGeminiModelName(geminiModel);
    let modelToUse = configuredModel;
    let url = buildGeminiGenerateUrl(modelToUse, apiKey);

    let response = await fetch(url, {
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

    let data = await response.json();

    // If configured model is unavailable for this key/version, discover a valid one and retry once.
    if (!response.ok && /not found|not supported for generateContent/i.test(data?.error?.message || '')) {
        modelToUse = await findFallbackGeminiModel(apiKey);
        url = buildGeminiGenerateUrl(modelToUse, apiKey);

        response = await fetch(url, {
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

        data = await response.json();
    }

    if (!response.ok) {
        const message = data?.error?.message || 'Gemini request failed.';
        const error = new Error(message);
        error.statusCode = response.status;
        error.isGeminiQuotaError = isGeminiQuotaError(message);
        error.retryAfterSeconds = extractRetryAfterSeconds(message);
        throw error;
    }

    const explanation = extractGeminiText(data);

    if (!explanation) {
        throw new Error('Gemini returned an empty response.');
    }

    return explanation;
}

async function callGroq(prompt, apiKey) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
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
        const message = data?.error?.message || 'Groq request failed.';
        const error = new Error(message);
        error.statusCode = response.status;
        error.isGroqQuotaError = isGroqQuotaError(message);
        throw error;
    }

    const explanation = extractOpenAIText(data);

    if (!explanation) {
        throw new Error('Groq returned an empty response.');
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

        const { aiProvider, aiApiKey, aiApiKeySecondary, openAiApiKey } = getEnvConfig();

        if (!aiProvider || !aiApiKey) {
            res.status(501);
            throw new Error('AI provider is not configured. Set AI_PROVIDER and AI_API_KEY in backend/.env.');
        }

        const provider = aiProvider.toLowerCase();
        let explanation = '';

        if (provider === 'openai') {
            explanation = await callOpenAI(prompt, aiApiKey);
        } else if (provider === 'groq') {
            explanation = await callGroq(prompt, aiApiKey);
        } else if (provider === 'gemini') {
            try {
                explanation = await callGemini(prompt, aiApiKey);
            } catch (primaryError) {
                if (primaryError?.isGeminiQuotaError && openAiApiKey) {
                    explanation = await callOpenAI(prompt, openAiApiKey);
                    return res.status(200).json({
                        provider: 'openai-fallback',
                        explanation
                    });
                }

                if (!aiApiKeySecondary) {
                    if (primaryError?.isGeminiQuotaError) {
                        const retryAfterSeconds = primaryError.retryAfterSeconds || 60;
                        res.setHeader('Retry-After', String(retryAfterSeconds));
                        res.status(429);
                    }
                    throw primaryError;
                }

                try {
                    explanation = await callGemini(prompt, aiApiKeySecondary);
                } catch (secondaryError) {
                    if (secondaryError?.isGeminiQuotaError && openAiApiKey) {
                        explanation = await callOpenAI(prompt, openAiApiKey);
                        return res.status(200).json({
                            provider: 'openai-fallback',
                            explanation
                        });
                    }

                    if (secondaryError?.isGeminiQuotaError) {
                        const retryAfterSeconds = secondaryError.retryAfterSeconds || 60;
                        res.setHeader('Retry-After', String(retryAfterSeconds));
                        res.status(429);
                    }

                    throw secondaryError;
                }
            }
        } else {
            res.status(400);
            throw new Error('Unsupported AI provider. Use openai, gemini, or groq.');
        }

        res.status(200).json({
            provider,
            explanation
        });
    } catch (error) {
        if (error?.isGeminiQuotaError || error?.isOpenAIQuotaError || error?.isGroqQuotaError) {
            const retryAfterSeconds = error?.retryAfterSeconds || 60;

            if (res.statusCode < 400) {
                res.status(429);
            }

            res.setHeader('Retry-After', String(retryAfterSeconds));

            const quotaError = new Error('AI quota exceeded for configured providers. Please retry later or upgrade billing plan.');
            quotaError.code = 'AI_QUOTA_EXCEEDED';
            quotaError.retryAfterSeconds = retryAfterSeconds;

            return next(quotaError);
        }

        next(error);
    }
}

module.exports = {
    explainCode
};
