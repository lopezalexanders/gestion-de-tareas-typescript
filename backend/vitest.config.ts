import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      lines: 70,
    },
    include: ['src/tests/**/*.test.ts'],
  },
});
