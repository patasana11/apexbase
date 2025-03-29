import { WebDriver, By, until } from 'selenium-webdriver';
import { setupDriver, captureBrowserLogs, captureScreenshot, waitForElement } from './setup';
import { describe, it, beforeEach, afterEach } from 'vitest';
import assert from 'assert';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

describe('Dashboard Tests', () => {
  let driver: WebDriver;

  beforeEach(async () => {
    // Setup the WebDriver before each test
    driver = await setupDriver();
    
    // Login before each test
    await login(driver);
  });

  afterEach(async () => {
    // Capture logs and close the driver after each test
    await captureBrowserLogs(driver, 'dashboard');
    if (driver) {
      await driver.quit();
    }
  });

  // Helper function to login
  async function login(driver: WebDriver): Promise<void> {
    try {
      await driver.get(`${BASE_URL}/login`);
      
      const emailInput = await driver.findElement(By.css('input[type="email"]'));
      const passwordInput = await driver.findElement(By.css('input[type="password"]'));
      const loginButton = await driver.findElement(By.css('button[type="submit"]'));
      
      await emailInput.sendKeys(TEST_EMAIL);
      await passwordInput.sendKeys(TEST_PASSWORD);
      await loginButton.click();
      
      // Wait for redirect to dashboard
      await driver.wait(async () => {
        const currentUrl = await driver.getCurrentUrl();
        return currentUrl.includes('/dashboard');
      }, 5000, 'Timed out waiting for redirect to dashboard after login');
      
    } catch (error) {
      console.error('Failed to login:', error);
      await captureScreenshot(driver, 'login_for_dashboard_failure');
      throw new Error(`Login failed: ${error}`);
    }
  }

  // These tests are skipped by default as they require authentication
  // Remove the .skip to run them with valid credentials
  it.skip('should display dashboard components after login', async () => {
    try {
      // Check that we're on the dashboard page
      const currentUrl = await driver.getCurrentUrl();
      assert(currentUrl.includes('/dashboard'), `Expected URL to include '/dashboard', but got ${currentUrl}`);
      
      // Check for the presence of key dashboard elements
      const sidebarOrNavigation = await waitForElement(driver, By.css('aside, nav, [class*="sidebar"]'));
      assert(sidebarOrNavigation, 'Sidebar or navigation should be present');
      
      // Check for the main content area
      const mainContent = await waitForElement(driver, By.css('main, [class*="content"]'));
      assert(mainContent, 'Main content area should be present');
      
      // Check for user profile or user menu
      const userElements = await driver.findElements(By.css('[class*="user"], [class*="profile"], [class*="avatar"]'));
      assert(userElements.length > 0, 'User profile or menu should be present');
      
      // Check for console errors
      const logs = await driver.manage().logs().get('browser');
      const errors = logs.filter(entry => 
        entry.level.name === 'SEVERE' && 
        !entry.message.includes('favicon.ico')
      );
      assert(errors.length === 0, `Found ${errors.length} console errors: ${JSON.stringify(errors)}`);
      
    } catch (error) {
      await captureScreenshot(driver, 'dashboard_display_failure');
      throw error;
    }
  });

  it.skip('should navigate between dashboard sections', async () => {
    try {
      // First, identify navigation items in the sidebar
      const navigationItems = await driver.findElements(By.css('aside a, nav a, [class*="sidebar"] a, [role="menuitem"]'));
      assert(navigationItems.length > 0, 'Navigation items should be present');
      
      // For each navigation item (up to 3 to keep the test manageable)
      const itemsToTest = Math.min(navigationItems.length, 3);
      
      for (let i = 0; i < itemsToTest; i++) {
        // Get all navigation items again (as DOM might have changed after click)
        const navItems = await driver.findElements(By.css('aside a, nav a, [class*="sidebar"] a, [role="menuitem"]'));
        
        // Get the text and href before clicking
        const itemText = await navItems[i].getText();
        const itemHref = await navItems[i].getAttribute('href') || '';
        
        console.log(`Testing navigation item: ${itemText} (${itemHref})`);
        
        // Click the navigation item
        await navItems[i].click();
        
        // Wait for the URL to change or page to load
        await driver.sleep(1000);
        
        // Check if URL changed to match the href
        if (itemHref && !itemHref.startsWith('javascript:')) {
          const currentUrl = await driver.getCurrentUrl();
          const hrefPath = new URL(itemHref).pathname;
          assert(
            currentUrl.includes(hrefPath), 
            `Expected URL to include '${hrefPath}', but got '${currentUrl}'`
          );
        }
        
        // Check for console errors after navigation
        const logs = await driver.manage().logs().get('browser');
        const errors = logs.filter(entry => 
          entry.level.name === 'SEVERE' && 
          !entry.message.includes('favicon.ico')
        );
        assert(errors.length === 0, `Found ${errors.length} console errors after clicking ${itemText}: ${JSON.stringify(errors)}`);
        
        // Go back to dashboard if we navigated away
        const currentUrl = await driver.getCurrentUrl();
        if (!currentUrl.includes('/dashboard')) {
          await driver.get(`${BASE_URL}/dashboard`);
          await driver.sleep(1000);
        }
      }
      
    } catch (error) {
      await captureScreenshot(driver, 'dashboard_navigation_failure');
      throw error;
    }
  });

  it.skip('should check if dashboard data loads correctly', async () => {
    try {
      // Look for common data container elements
      const dataContainers = await driver.findElements(By.css('[class*="card"], [class*="panel"], [class*="widget"], [class*="grid"]'));
      assert(dataContainers.length > 0, 'Dashboard should display data containers (cards, panels, widgets)');
      
      // Check for loading indicators
      const loadingIndicators = await driver.findElements(By.css('[class*="loading"], [class*="spinner"], [class*="progress"]'));
      
      if (loadingIndicators.length > 0) {
        // If there are loading indicators, wait for them to disappear
        await driver.wait(async () => {
          const visibleLoaders = await driver.findElements(By.css('[class*="loading"]:not([style*="display: none"])'));
          return visibleLoaders.length === 0;
        }, 10000, 'Timed out waiting for loading indicators to disappear');
      }
      
      // Wait a bit more to make sure data has loaded
      await driver.sleep(1000);
      
      // Check for empty states or no data messages
      const emptyStates = await driver.findElements(By.css('[class*="empty"], [class*="no-data"]'));
      const noDataText = await driver.findElements(By.xpath("//*[contains(text(), 'No data') or contains(text(), 'Empty') or contains(text(), 'Nothing to display')]"));
      
      // If we have either empty states or no data messages across all cards, log it (but don't fail the test)
      if (emptyStates.length > 0 || noDataText.length > 0) {
        console.warn('Some dashboard components show empty states or no data messages');
      }
      
      // Check for actual data content
      // This will be specific to your application, but we can look for tables, lists, etc.
      const dataElements = await driver.findElements(By.css('table, [role="table"], [class*="list"], [class*="data"], [class*="content"]'));
      assert(dataElements.length > 0, 'Dashboard should display data elements like tables or lists');
      
      // Check if some data elements have child nodes (meaning they contain data)
      let hasData = false;
      for (const element of dataElements) {
        const children = await element.findElements(By.css('*'));
        if (children.length > 5) { // Arbitrary threshold to consider it populated
          hasData = true;
          break;
        }
      }
      
      // Log if no data appears to be loaded (but don't fail the test)
      if (!hasData) {
        console.warn('Dashboard appears to be empty or has very little data');
      }
      
    } catch (error) {
      await captureScreenshot(driver, 'dashboard_data_loading_failure');
      throw error;
    }
  });
}); 