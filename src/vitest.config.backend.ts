import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'backend',
    include: ['backend/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'coverage'],
  },
})
