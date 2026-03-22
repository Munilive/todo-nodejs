import { base } from '@munilive/eslint-config';

export default [
  // Legacy CommonJS JS files will be rewritten in Phase 3/4 (TypeScript + NestJS)
  { ignores: ['server/api/**/*.js'] },
  ...base,
];
