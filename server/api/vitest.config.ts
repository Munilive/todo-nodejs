import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['api/src/**/*.spec.ts', 'api/test/**/*.e2e-spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['api/src/**'],
      exclude: ['api/src/main.ts', 'api/src/**/*.spec.ts'],
    },
  },
  plugins: [
    tsconfigPaths(),
    swc.vite({
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
        },
        transform: {
          decoratorMetadata: true,
        },
      },
    }),
  ],
});
