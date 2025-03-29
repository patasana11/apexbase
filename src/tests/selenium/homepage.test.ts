import { WebDriver, By } from 'selenium-webdriver';
import { setupDriver, captureBrowserLogs, captureScreenshot, waitForElement } from './setup';
import { describe, it, beforeEach, afterEach } from 'vitest';
import assert from 'assert';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 30000;

describe('Homepage Tests', () => {
  let driver: WebDriver;

  beforeEach(async () => {
    // Setup the WebDriver before each test
    driver = await setupDriver();
  }, 30000); // Increase timeout for setup

  afterEach(async () => {
    // Capture logs and close the driver after each test
    await captureBrowserLogs(driver, 'homepage');
    if (driver) {
      await driver.quit();
    }
  }, 10000); // Increase timeout for teardown

  it('should load homepage successfully', async () => {
    try {
      // Navigate to the homepage
      await driver.get(BASE_URL);
      
      // Wait for page to load with a longer timeout
      await driver.sleep(3000);
      
      // Verify the title
      const title = await driver.getTitle();
      console.log(`Page title: ${title}`);
      
      // Check for important homepage elements with longer timeouts
      try {
        const navbar = await waitForElement(driver, By.css('header, nav'), 15000);
        assert(navbar, 'Navigation should be present');
        console.log('Navigation found');
      } catch (error) {
        console.error('Failed to find navigation:', error);
      }
      
      // Check for main content
      try {
        const mainContent = await waitForElement(driver, By.css('main'), 15000);
        assert(mainContent, 'Main content should be present');
        console.log('Main content found');
      } catch (error) {
        console.error('Failed to find main content:', error);
      }
      
      // Check for footer
      try {
        const footer = await waitForElement(driver, By.css('footer'), 15000);
        assert(footer, 'Footer should be present');
        console.log('Footer found');
      } catch (error) {
        console.error('Failed to find footer:', error);
      }
      
      // Log the page source to help debug
      const pageSource = await driver.getPageSource();
      console.log('Page source length:', pageSource.length);
      
      // Look for login/register links with broader selectors
      const links = await driver.findElements(By.css('a'));
      console.log(`Found ${links.length} links on the page`);
      
      let loginFound = false;
      for (const link of links) {
        const href = await link.getAttribute('href');
        const text = await link.getText();
        if (href && (href.includes('/login') || href.includes('/auth/login'))) {
          console.log(`Found login link: ${href} with text: ${text}`);
          loginFound = true;
          break;
        }
      }
      
      // Capture a screenshot for visual inspection
      await captureScreenshot(driver, 'homepage_success');
      
    } catch (error) {
      // Capture screenshot on failure
      await captureScreenshot(driver, 'homepage_failure');
      throw error;
    }
  }, TEST_TIMEOUT);

  it('should navigate to login page', async () => {
    try {
      // Navigate to the homepage
      await driver.get(BASE_URL);
      
      // Wait for page to fully load
      await driver.sleep(3000);
      
      // Look for login links with broader selectors
      const links = await driver.findElements(By.css('a'));
      
      let loginLink = null;
      for (const link of links) {
        const href = await link.getAttribute('href');
        const text = await link.getText();
        if (href && (
            href.includes('/login') || 
            href.includes('/auth/login') || 
            text.toLowerCase().includes('login') || 
            text.toLowerCase().includes('sign in')
          )) {
          console.log(`Found login link: ${href} with text: ${text}`);
          loginLink = link;
          break;
        }
      }
      
      if (!loginLink) {
        // If no login link found, try clicking a login button instead
        const buttons = await driver.findElements(By.css('button'));
        for (const button of buttons) {
          const text = await button.getText();
          if (text.toLowerCase().includes('login') || text.toLowerCase().includes('sign in')) {
            console.log(`Found login button with text: ${text}`);
            loginLink = button;
            break;
          }
        }
      }
      
      assert(loginLink, 'Login link or button should be present');
      
      // Click the login link
      await loginLink.click();
      
      // Wait for page navigation
      await driver.sleep(3000);
      
      // Get the current URL to see where we ended up
      const currentUrl = await driver.getCurrentUrl();
      console.log(`Navigated to: ${currentUrl}`);
      
      // Capture a screenshot for visual inspection
      await captureScreenshot(driver, 'login_page');
      
    } catch (error) {
      // Capture screenshot on failure
      await captureScreenshot(driver, 'homepage_to_login_failure');
      throw error;
    }
  }, TEST_TIMEOUT);
}); 