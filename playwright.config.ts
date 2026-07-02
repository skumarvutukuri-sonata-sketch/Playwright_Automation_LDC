import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env') });

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

const storageStatePath = path.resolve(
  __dirname,
  'tests/setup/storageState.json'
);

const hasStorageState = fs.existsSync(storageStatePath);
const reuseStorageState = process.env.REUSE_STORAGE_STATE === 'true' && hasStorageState;

const projects = [] as NonNullable<ReturnType<typeof defineConfig>['projects']>;

if (!reuseStorageState) {
  projects.push({
    name: 'setup',
    testMatch: /.*\.setup\.ts/
  });
}

projects.push({
  name: 'chromium',
  use: {
    ...devices['Desktop Chrome'],
    storageState: storageStatePath
  },
  dependencies: reuseStorageState ? [] : ['setup']
});

export default defineConfig({
  
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),

  testDir: './tests',
  outputDir: 'test-results',
  timeout: 60_000,
  
  expect: {
    timeout: 20_000
  },

  // 🚀 UPGRADE 1: Allows your dynamic loop tests to be split across multiple browsers
  fullyParallel: true,
  
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,

  // 🚀 UPGRADE 2: Unlocks maximum speed based on your hardware!
  workers: process.env.CI ? 4 : '50%',

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/test-results.json' }],
    ['allure-playwright', { detail: true, suiteTitle: false }]
  ],

  use: {
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: process.env.CI ? true : false
  },

  projects
});