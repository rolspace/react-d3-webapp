import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      'src/vitest.config.backend.ts',
      'src/vitest.config.frontend.ts',
    ],
  },
})
