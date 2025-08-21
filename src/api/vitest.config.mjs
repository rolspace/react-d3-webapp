import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/*.test.[jt]s'],
    exclude: ['**/node_modules/**', '**/coverage/**', '**/.env'],
    coverage: {
      provider: 'v8',
      include: [
        '**/*.{js,ts}',
      ],
      exclude: ['index.js'],
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
    },
  },
})
