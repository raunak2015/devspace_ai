const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function request(path, payload) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    let data = null;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        const message = data?.message || 'Request failed. Please try again.';
        throw new Error(message);
    }

    return data;
}

async function loginUser(payload) {
    return request('/auth/login', payload);
}

async function registerUser(payload) {
    return request('/auth/register', payload);
}

export {
    loginUser,
    registerUser
};
