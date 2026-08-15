import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      'src/vitest.config.backend.ts',
      'src/vitest.config.frontend.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/backend/**/*.ts', 'src/frontend/**/*.{ts,tsx}'],
      exclude: ['**/*.test.{ts,tsx}', '**/__tests__/**'],
      reportsDirectory: './src/coverage',
    },
  },
})
