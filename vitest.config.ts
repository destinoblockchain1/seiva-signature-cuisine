import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/supabase-keepalive.*.test.ts"],
    environment: "node",
    testTimeout: 15000,
    hookTimeout: 30000,
  },
});
