import { Builder, WebDriver, By, until, logging } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';
import fs from 'fs';
import path from 'path';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'src/tests/selenium/logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Initialize a new WebDriver with Chrome
export async function setupDriver(): Promise<WebDriver> {
  // Check if we should run in headless mode
  const headless = process.env.SELENIUM_HEADLESS !== 'false';
  console.log(`Running tests in ${headless ? 'headless' : 'visible'} mode`);

  try {
    // Configure Chrome options
    const chromeOptions = new Options();
    
    // Only add headless mode if specified
    if (headless) {
      chromeOptions.addArguments(
        '--headless=new',
        '--disable-gpu'
      );
    }
    
    // Add common arguments
    chromeOptions.addArguments(
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1920,1080',
      '--disable-extensions',
      '--disable-popup-blocking',
      '--disable-infobars',
      '--ignore-certificate-errors'
    );
    
    // Set longer timeouts
    chromeOptions.addArguments('--start-maximized');
    
    console.log('Creating WebDriver...');
    // Create the WebDriver
    const driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();
    
    console.log('WebDriver created successfully');
    
    // Configure timeouts
    await driver.manage().setTimeouts({
      implicit: 10000,
      pageLoad: 30000,
      script: 30000
    });
    
    return driver;
  } catch (error) {
    console.error('Error creating WebDriver:', error);
    throw error;
  }
}

// Capture console logs from the browser
export async function captureBrowserLogs(driver: WebDriver, testName: string): Promise<void> {
  try {
    console.log('Capturing browser logs...');
    const logs = await driver.manage().logs().get(logging.Type.BROWSER);
    if (logs.length > 0) {
      const logFile = path.join(logsDir, `${testName}_browser_logs.json`);
      fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
      console.log(`Browser logs saved to ${logFile}`);
      
      // Log severe errors to console
      const severeErrors = logs.filter(entry => entry.level.name === 'SEVERE');
      if (severeErrors.length > 0) {
        console.error(`Found ${severeErrors.length} severe errors in browser console:`);
        severeErrors.forEach((error, index) => {
          console.error(`[${index + 1}] ${error.message}`);
        });
      }
    } else {
      console.log('No browser logs captured');
    }
  } catch (error) {
    console.error('Error capturing browser logs:', error);
  }
}

// Capture a screenshot when a test fails
export async function captureScreenshot(driver: WebDriver, testName: string): Promise<void> {
  try {
    console.log(`Taking screenshot for ${testName}...`);
    const screenshot = await driver.takeScreenshot();
    const screenshotFile = path.join(logsDir, `${testName}.png`);
    fs.writeFileSync(screenshotFile, screenshot, 'base64');
    console.log(`Screenshot saved to ${screenshotFile}`);
  } catch (error) {
    console.error('Error capturing screenshot:', error);
  }
}

// Helper function to wait for an element to be visible
export async function waitForElement(driver: WebDriver, locator: By, timeout = 10000): Promise<any> {
  console.log(`Waiting for element ${locator.toString()} with timeout ${timeout}ms...`);
  try {
    const element = await driver.wait(until.elementLocated(locator), timeout);
    await driver.wait(until.elementIsVisible(element), timeout);
    console.log(`Element ${locator.toString()} found`);
    return element;
  } catch (error) {
    console.error(`Timeout waiting for element ${locator.toString()}:`, error);
    
    // Take a screenshot to help debug
    await captureScreenshot(driver, `element_not_found_${Date.now()}`);
    
    // Get page source to help debug
    try {
      const pageSource = await driver.getPageSource();
      const debugFile = path.join(logsDir, `page_source_${Date.now()}.html`);
      fs.writeFileSync(debugFile, pageSource);
      console.log(`Page source saved to ${debugFile}`);
    } catch (error) {
      console.error('Error capturing page source:', error);
    }
    
    throw error;
  }
} 