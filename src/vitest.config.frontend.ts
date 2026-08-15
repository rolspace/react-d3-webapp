import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    name: 'frontend',
    environment: 'jsdom',
    globals: true, // Enable auto cleanup and global test APIs
    include: ['frontend/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'coverage'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './frontend'),
    },
  },
})
