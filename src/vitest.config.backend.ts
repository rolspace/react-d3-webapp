import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'backend',
    include: ['backend/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'coverage'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['backend/**/*.ts'],
      exclude: ['backend/**/*.test.ts', 'backend/**/__tests__/**'],
      reportsDirectory: './coverage/backend',
    },
  },
})
