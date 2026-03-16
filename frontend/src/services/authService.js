const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const SESSION_KEY = 'devspace_user';

function getAuthToken() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return '';

    try {
        const parsed = JSON.parse(raw);
        return parsed?.token || '';
    } catch {
        return '';
    }
}

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
        // Return structured data for specific status codes if needed
        const message = data?.message || 'Request failed. Please try again.';
        const err = new Error(message);
        err.status = response.status;
        err.data = data;
        throw err;
    }

    return data;
}

async function authRequest(path, method, payload) {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: payload ? JSON.stringify(payload) : undefined
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

async function verifyOtp(payload) {
    return request('/auth/verify-otp', payload);
}

async function resendOtp(payload) {
    return request('/auth/resend-otp', payload);
}

async function getCurrentUserProfile() {
    return authRequest('/auth/me', 'GET');
}

async function updateUserProfile(payload) {
    return authRequest('/auth/profile', 'PATCH', payload);
}

export {
    loginUser,
    registerUser,
    verifyOtp,
    resendOtp,
    getCurrentUserProfile,
    updateUserProfile
};
