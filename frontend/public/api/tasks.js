const API_BASE = window.__API_BASE__ ??
    import.meta.env?.VITE_API_BASE ??
    'http://localhost:3000';
async function handleResponse(response) {
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorBody.message ?? 'Error desconocido');
    }
    return (await response.json());
}
export async function createTask(payload) {
    const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return handleResponse(response);
}
export async function listTasks(params = {}) {
    const query = new URLSearchParams();
    if (params.status) {
        query.set('status', params.status);
    }
    if (params.q) {
        query.set('q', params.q);
    }
    const response = await fetch(`${API_BASE}/tasks?${query.toString()}`);
    return handleResponse(response);
}
export async function updateTaskStatus(id, status) {
    const response = await fetch(`${API_BASE}/tasks/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
    return handleResponse(response);
}
