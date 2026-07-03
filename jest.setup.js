// Load .env.test (preferred) or .env into process.env before any test runs.
// Keeps real production credentials out of the test process unless the user
// explicitly opts in via .env.test.
const path = require('path');
const dotenv = require('dotenv');

const testEnv = path.join(process.cwd(), '.env.test');
const fallbackEnv = path.join(process.cwd(), '.env');

const fs = require('fs');
const target = fs.existsSync(testEnv) ? testEnv : fallbackEnv;

dotenv.config({ path: target });