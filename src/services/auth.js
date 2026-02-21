const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://devhacks-backend.vercel.app';

const parseBody = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return response.json();
    }
    const text = await response.text();
    if (!text) return {};
    try {
        return JSON.parse(text);
    } catch {
        return { message: text };
    }
};

const parseError = async (response) => {
    let message = 'Request failed';
    try {
        const data = await parseBody(response);
        message = data?.message || data?.error || message;
    } catch {
        message = response.statusText || message;
    }
    return message;
};

export const signupUser = async ({ name, email, password, role }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
    });

    if (!response.ok) {
        throw new Error(await parseError(response));
    }

    return parseBody(response);
};

export const loginUser = async ({ email, password, role }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
    });

    if (!response.ok) {
        throw new Error(await parseError(response));
    }

    return parseBody(response);
};
