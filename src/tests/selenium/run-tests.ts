const { spawn } = require('child_process');
const { mkdir, existsSync } = require('fs');
const path = require('path');

// Ensure directories exist
const logsDir = path.join(process.cwd(), 'src/tests/selenium/logs');
if (!existsSync(logsDir)) {
  mkdir(logsDir, { recursive: true }, (err: any) => {
    if (err) throw err;
    console.log('Logs directory created:', logsDir);
  });
}

// Available test files
const testFiles = [
  'homepage.test.ts',
  'login.test.ts',
  'dashboard.test.ts'
];

// Parse command line arguments
const args = process.argv.slice(2);
const specificTests = args.filter(arg => !arg.startsWith('--'));
const headless = !args.includes('--no-headless');
const verbose = args.includes('--verbose');

// If specific tests were specified, only run those
const testsToRun = specificTests.length > 0
  ? specificTests.map(testName => {
      // Add .test.ts extension if not provided
      if (!testName.endsWith('.test.ts') && !testName.endsWith('.ts')) {
        return `${testName}.test.ts`;
      }
      return testName;
    })
  : testFiles;

console.log('Running Selenium tests with Vitest...');
console.log('Headless mode:', headless ? 'enabled' : 'disabled');
if (!headless) {
  console.log('NOTE: Running in non-headless mode will open browser windows');
}

// Set environment variables
process.env.SELENIUM_HEADLESS = headless ? 'true' : 'false';

// Build the vitest command
const vitestArgs = [
  'vitest',
  'run',
  ...testsToRun.map(test => `src/tests/selenium/${test}`),
  verbose ? '--reporter=verbose' : ''
];

// Run the tests using Vitest
const vitest = spawn('npx', vitestArgs, { 
  stdio: 'inherit',
  shell: true
});

vitest.on('close', (code: number | null) => {
  console.log(`Test process exited with code ${code}`);
  process.exit(code || 0);
}); 