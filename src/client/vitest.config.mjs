import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/*.test.[jt]s?(x)'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.env'],
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: [
        '**/*.{js,ts,jsx,tsx}',
      ],
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
    },
  },
})
