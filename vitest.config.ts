import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["tests/**/*.test.ts"],
    testTimeout: 60_000,
    hookTimeout: 30_000,
    reporters: ["verbose"],
    pool: "forks",
  },
});
