# Selenium Tests for ApexBase

This directory contains Selenium tests for the ApexBase application. These tests use Chrome WebDriver to automate browser interactions and verify application functionality.

## Setup Requirements

- `selenium-webdriver`: Core Selenium library
- `chromedriver`: Chrome-specific WebDriver
- `ts-node`: TypeScript execution environment
- `vitest`: Test runner

## Test Structure

- `setup.ts`: Utility functions for WebDriver setup, screenshot capture, and logging
- `homepage.test.ts`: Tests for the application's homepage
- `login.test.ts`: Tests for the login functionality
- `dashboard.test.ts`: Tests for the dashboard (requires authentication)
- `functions.test.ts`: Tests for the functions page (requires authentication)
- `run-tests.sh`: Script for running tests with various options

## Running Tests

You can run the tests using npm scripts:

```bash
# Run all tests
npm run test:selenium

# Run only homepage tests
npm run test:selenium:homepage

# Run only login tests
npm run test:selenium:login

# Run only dashboard tests
npm run test:selenium:dashboard

# Run only functions tests
npm run test:selenium:functions

# Run tests with the browser visible (non-headless mode)
npm run test:selenium:visual

# Run tests with detailed logging
npm run test:selenium -- --verbose
```

## Authentication Requirements

Some tests require valid credentials:

- `dashboard.test.ts`: Requires valid login credentials to access protected pages
- `functions.test.ts`: Requires valid login credentials to test function creation and management

### Setting Credentials

Set environment variables in a `.env` file:

```
TEST_USER_EMAIL=yourvaliduser@example.com
TEST_USER_PASSWORD=yourpassword
```

Or modify the test files directly:

```typescript
const TEST_EMAIL = 'your-valid-email@example.com';
const TEST_PASSWORD = 'your-valid-password';
```

## Functions Test

The `functions.test.ts` file tests the function management capabilities:

- Login and navigation to the functions page
- Creating a new function with a unique name and description
- Verifying the function appears in the function list

The test is designed to be adaptive:
- If the server returns an error when saving a function, it will verify just the UI form interactions
- If the application doesn't support clicking functions to navigate to a detail view, it will verify the function exists in the list view only
- Full function lifecycle testing (edit/delete) is attempted but skipped if the application doesn't support detailing into functions

## Logs and Screenshots

During test execution, logs and screenshots are saved:

- Browser logs: `src/tests/selenium/logs/<testname>_browser_logs.json`
- Failure screenshots: `src/tests/selenium/logs/<descriptive_name>.png`

These are helpful for debugging test failures, especially since Selenium tests interact with the actual UI.

## Troubleshooting

Common issues:

1. **Element not found**: The test might be running too fast. Increase wait times or use `waitForElement`.
2. **Element not interactable**: The element might be obscured, not in viewport, or disabled. Verify that it's properly rendered before interaction.
3. **Chrome crashes**: Try running in non-headless mode to see what's happening.
4. **Auth issues**: Verify credentials and that cookies are being set correctly.
5. **Network errors**: Check if the application is running correctly on the expected URL.

## Best Practices

1. **Keep tests isolated**: Each test should be independent. Avoid dependencies between tests.
2. **Clean up resources**: Ensure WebDriver is properly closed after tests.
3. **Meaningful logging**: Add descriptive logs to help debug failures.
4. **Use screenshots**: Capture state at key points in the test.
5. **Handle timeouts appropriately**: Adjust timeouts based on what's being tested.

## Next Steps

1. **Component-specific tests**: Add more detailed tests for each component
2. **API tests**: Test the backend APIs directly
3. **User flow tests**: Test complex user journeys across multiple pages
4. **Mobile responsiveness**: Test on various viewport sizes
5. **Performance testing**: Measure and monitor application performance
6. **CI/CD integration**: Integrate tests into the CI/CD pipeline

## Maintenance

Keep tests updated as the application evolves to prevent flakiness. If the UI changes, update selectors and test flows accordingly. 