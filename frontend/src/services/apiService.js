const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const SESSION_KEY = 'devspace_user';

function getAuthToken() {
    const raw = localStorage.getItem(SESSION_KEY);

    if (!raw) {
        return '';
    }

    try {
        const session = JSON.parse(raw);
        if (session?.user && !session?.token) {
            localStorage.removeItem(SESSION_KEY);
            return '';
        }
        return session?.token || '';
    } catch {
        localStorage.removeItem(SESSION_KEY);
        return '';
    }
}

async function apiFetch(path, options = {}) {
    const token = getAuthToken();

    if (!token && !path.startsWith('/auth/')) {
        throw new Error('Session expired. Please log in again.');
    }

    const headers = {
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers
    });

    let data = null;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        const message = data?.message || 'Request failed. Please try again.';

        if (
            response.status === 401 &&
            /invalid signature|jwt|token|session expired|authorization/i.test(message)
        ) {
            localStorage.removeItem(SESSION_KEY);
            throw new Error('Session expired. Please log in again.');
        }

        throw new Error(message);
    }

    return data;
}

function get(path) {
    return apiFetch(path);
}

function post(path, payload) {
    return apiFetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}

function patch(path, payload) {
    return apiFetch(path, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}

export { get, post, patch };
