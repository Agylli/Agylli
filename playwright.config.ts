import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
const chromiumPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 3,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: { ...(chromiumPath ? { executablePath: chromiumPath } : {}) },
  },
  projects: [375, 768, 1440].map(width => ({ name: `chromium-${width}`, use: { browserName: "chromium", viewport: { width, height: 1000 } } })),
  webServer: { command: "npm run start -- --port 3000", url: "http://127.0.0.1:3000", reuseExistingServer: !process.env.CI, timeout: 60_000 },
});
