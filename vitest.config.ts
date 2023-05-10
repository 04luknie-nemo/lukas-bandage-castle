import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['apps/*/src/**/*.test.{ts,tsx}', 'packages/*/src/**/*.test.ts'],
    environment: 'node',
    // the API tests that hit the database need the root .env
    setupFiles: ['./vitest.setup.ts'],
  },
})
