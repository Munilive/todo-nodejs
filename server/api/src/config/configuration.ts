export const configuration = () => ({
  port: parseInt(process.env['PORT'] ?? '8080', 10),
  healthCheck: process.env['HEALTH_CHECK_URL'] ?? '/health',
  db: {
    uri: process.env['DB_URI'] ?? '',
    poolSize: parseInt(process.env['DB_POOL_SIZE'] ?? '5', 10),
  },
});

export type AppConfig = ReturnType<typeof configuration>;
