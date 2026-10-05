import { defineConfig, devices } from '@playwright/test'

const PORT = 3000

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // test.only の消し忘れをCIで検出
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry', // 失敗時の原因調査用
  },

  projects: [{ name: 'chomium', use: { ...devices['Desktop Chrome'] } }],

  // Playwrightがサーバーを起動して、立ち上がるまで待つ
  webServer: {
    // CI: ビルド済みの本番サーバー / ローカル: 開発サーバー
    command: process.env.CI ? 'pnpm start' : 'pnpm dev',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
