import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    name: 'frontend',
    environment: 'jsdom',
    include: ['frontend/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'coverage'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['frontend/**/*.{ts,tsx}'],
      exclude: ['frontend/**/*.test.{ts,tsx}', 'frontend/**/__tests__/**'],
      reportsDirectory: './coverage/frontend',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './frontend'),
    },
  },
})
