export type TodoStatus = 'todo' | 'in_progress' | 'done';
export type TodoContext = 'none' | 'work' | 'home';
export type ReminderOffsetUnit = 'minute' | 'hour' | 'day';
export type ReminderStatus = 'pending' | 'sent';

export interface ReminderInput {
  offsetValue: number;
  offsetUnit: ReminderOffsetUnit;
}

export interface Reminder {
  id: string;
  offsetValue: number;
  offsetUnit: ReminderOffsetUnit;
  remindAt: string;
  notifiedAt: string | null;
  createdAt: string;
}

export interface TodoListItem {
  id: string;
  title: string;
  status: TodoStatus;
  context: TodoContext;
  dueDate: string | null;
  createdAt: string;
  doneAt: string | null;
  reminderCount: number;
  pendingReminderCount: number;
}

export interface TodoDetail {
  id: string;
  title: string;
  status: TodoStatus;
  context: TodoContext;
  dueDate: string | null;
  createdAt: string;
  doneAt: string | null;
  reminders: Reminder[];
}

export interface TodoListResponse {
  items: TodoListItem[];
  totalCount: number;
  skip: number;
  limit: number;
  sort: string;
}

export interface TodoListParams {
  skip?: number;
  limit?: number;
  sort?: string;
  title?: string;
  status?: TodoStatus | '';
  context?: TodoContext | '';
  startCreatedAt?: string;
  endCreatedAt?: string;
  startDueDate?: string;
  endDueDate?: string;
}

export interface CreateTodoInput {
  title: string;
  status?: TodoStatus;
  context?: TodoContext;
  dueDate?: string;
  reminders?: ReminderInput[];
}

export interface UpdateTodoInput {
  title?: string;
  status?: TodoStatus;
  context?: TodoContext;
  dueDate?: string;
  reminders?: ReminderInput[];
}

export interface CreateTodoResponse {
  id: string;
}

export interface ReminderListItem {
  id: string;
  todoId: string;
  todoTitle: string;
  offsetValue: number;
  offsetUnit: ReminderOffsetUnit;
  remindAt: string;
  notifiedAt: string | null;
  createdAt: string;
}

export interface ReminderListResponse {
  items: ReminderListItem[];
  totalCount: number;
  skip: number;
  limit: number;
}

export interface ReminderListParams {
  skip?: number;
  limit?: number;
  todoId?: string;
  status?: ReminderStatus | '';
  startRemindAt?: string;
  endRemindAt?: string;
}

export interface StatsResponse {
  todo: {
    total: number;
    byStatus: {
      todo: number;
      in_progress: number;
      done: number;
    };
    byContext: {
      none: number;
      work: number;
      home: number;
    };
    overdue: number;
  };
  reminder: {
    total: number;
    pending: number;
    sent: number;
  };
}
