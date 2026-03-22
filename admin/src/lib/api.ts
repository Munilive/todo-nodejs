import type {
  StatsResponse,
  TodoListResponse,
  TodoListParams,
  TodoDetail,
  CreateTodoInput,
  UpdateTodoInput,
  CreateTodoResponse,
  ReminderListResponse,
  ReminderListParams,
  Reminder,
} from './types';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return import.meta.env.PUBLIC_API_URL ?? 'http://localhost:8080';
  }
  return import.meta.env.PUBLIC_API_URL ?? 'http://localhost:8080';
};

const BASE = '/admin/v1';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getBaseUrl()}${BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API Error ${res.status}: ${text}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      qs.set(key, String(value));
    }
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
}

// Stats
export function getStats(): Promise<StatsResponse> {
  return request<StatsResponse>('/stats');
}

// Todo
export function getTodos(params: TodoListParams = {}): Promise<TodoListResponse> {
  const query = buildQuery(params as Record<string, string | number | undefined | null>);
  return request<TodoListResponse>(`/todo${query}`);
}

export function getTodo(id: string): Promise<TodoDetail> {
  return request<TodoDetail>(`/todo/${id}`);
}

export function createTodo(data: CreateTodoInput): Promise<CreateTodoResponse> {
  return request<CreateTodoResponse>('/todo', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateTodo(id: string, data: UpdateTodoInput): Promise<void> {
  return request<void>(`/todo/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteTodo(id: string): Promise<void> {
  return request<void>(`/todo/${id}`, { method: 'DELETE' });
}

// Reminders
export function getReminders(params: ReminderListParams = {}): Promise<ReminderListResponse> {
  const query = buildQuery(params as Record<string, string | number | undefined | null>);
  return request<ReminderListResponse>(`/reminders${query}`);
}

export function getTodoReminders(todoId: string): Promise<Reminder[]> {
  return request<Reminder[]>(`/todo/${todoId}/reminders`);
}

export function deleteReminder(todoId: string, reminderId: string): Promise<void> {
  return request<void>(`/todo/${todoId}/reminders/${reminderId}`, { method: 'DELETE' });
}

export function notifyReminder(todoId: string, reminderId: string): Promise<void> {
  return request<void>(`/todo/${todoId}/reminders/${reminderId}/notify`, { method: 'POST' });
}
