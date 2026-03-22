export const configuration = () => ({
  db: {
    host: process.env['DB_HOST'] ?? 'localhost',
    port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
    name: process.env['DB_NAME'] ?? 'todo',
    user: process.env['DB_USER'] ?? 'postgres',
    password: process.env['DB_PASSWORD'] ?? '',
  },
  slack: {
    webhookUrl: process.env['SLACK_WEBHOOK_URL'] ?? '',
  },
});
