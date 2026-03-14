const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function apiFetch(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, options);

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

export { get, post };
