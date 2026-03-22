import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

interface TodoStatsRow {
  total: string;
  todo: string;
  in_progress: string;
  done: string;
  none: string;
  work: string;
  home: string;
  overdue: string;
}

interface ReminderStatsRow {
  total: string;
  pending: string;
  sent: string;
}

@Injectable()
export class AdminStatsService {
  constructor(private readonly em: EntityManager) {}

  async getOverview() {
    const conn = this.em.getConnection();

    const [todoRows, reminderRows] = await Promise.all([
      conn.execute<TodoStatsRow[]>(`
        SELECT
          COUNT(*)                                                               AS total,
          SUM(CASE WHEN status = 'todo'        THEN 1 ELSE 0 END)               AS todo,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END)               AS in_progress,
          SUM(CASE WHEN status = 'done'        THEN 1 ELSE 0 END)               AS done,
          SUM(CASE WHEN context = 'none'       THEN 1 ELSE 0 END)               AS none,
          SUM(CASE WHEN context = 'work'       THEN 1 ELSE 0 END)               AS work,
          SUM(CASE WHEN context = 'home'       THEN 1 ELSE 0 END)               AS home,
          SUM(CASE WHEN due_date < NOW() AND status != 'done' THEN 1 ELSE 0 END) AS overdue
        FROM todo
      `),
      conn.execute<ReminderStatsRow[]>(`
        SELECT
          COUNT(*)                                              AS total,
          SUM(CASE WHEN notified_at IS NULL     THEN 1 ELSE 0 END) AS pending,
          SUM(CASE WHEN notified_at IS NOT NULL THEN 1 ELSE 0 END) AS sent
        FROM todo_reminder
      `),
    ]);

    const t = todoRows[0];
    const r = reminderRows[0];

    return {
      todo: {
        total: parseInt(t.total),
        byStatus: {
          todo: parseInt(t.todo),
          in_progress: parseInt(t.in_progress),
          done: parseInt(t.done),
        },
        byContext: {
          none: parseInt(t.none),
          work: parseInt(t.work),
          home: parseInt(t.home),
        },
        overdue: parseInt(t.overdue),
      },
      reminder: {
        total: parseInt(r.total),
        pending: parseInt(r.pending),
        sent: parseInt(r.sent),
      },
    };
  }
}
