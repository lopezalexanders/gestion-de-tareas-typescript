export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'done';
  created_at: string;
  updated_at: string;
}

export interface PaginatedTasks {
  items: Task[];
  total: number;
}

const API_BASE = (window as unknown as { __API_BASE__?: string }).__API_BASE__ ??
  (import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ??
  'http://localhost:3000';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorBody.message ?? 'Error desconocido');
  }
  return (await response.json()) as T;
}

export async function createTask(payload: { title: string; description?: string; status?: string }): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<Task>(response);
}

export async function listTasks(params: { status?: string; q?: string } = {}): Promise<PaginatedTasks> {
  const query = new URLSearchParams();
  if (params.status) {
    query.set('status', params.status);
  }
  if (params.q) {
    query.set('q', params.q);
  }
  const response = await fetch(`${API_BASE}/tasks?${query.toString()}`);
  return handleResponse<PaginatedTasks>(response);
}

export async function updateTaskStatus(id: string, status: string): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse<Task>(response);
}
