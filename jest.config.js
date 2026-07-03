const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Load next.config.mjs and .env.* files into the test environment.
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  // The auth load test talks directly to Supabase via fetch — no jsdom needed.
  testEnvironment: 'node',

  // Default 5s is too short when we fire 1000 concurrent network calls.
  testTimeout: 5 * 60 * 1000,

  // Single load test, no parallelism — we want the 1000 calls to overlap.
  maxWorkers: 1,

  // Quiet down console noise from Supabase clients we create in a loop.
  silent: false,

  // Load .env.test (or .env as fallback) before tests run.
  setupFiles: ['<rootDir>/jest.setup.js'],
};

module.exports = createJestConfig(config);