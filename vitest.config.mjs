import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      'src/client/vitest.config.mjs',
      'src/api/vitest.config.mjs',
    ],
  },
})
