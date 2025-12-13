import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      './vitest.config.backend.ts',
      './vitest.config.frontend.ts',
    ],
  },
})
