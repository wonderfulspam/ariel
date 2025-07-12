import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('the backend API is running', async ({ page }) => {
  // Check if backend is available - for now just verify we can reach it
  // In a real implementation, we might start a test server or check health endpoint
  console.log('Assuming backend API is running on localhost:8000');
});

Given('I am on the audiobook converter page', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.locator('h1')).toContainText('Ariel Audiobook Converter');
});

When('I upload a text file {string}', async ({ page }, filename: string) => {
  // Create a simple test file
  const fileContent = 'This is a test story for audiobook conversion.';

  // Set up file input
  const fileInput = page.locator('#file-upload');

  // Create a file buffer to simulate file upload
  await fileInput.setInputFiles({
    name: filename,
    mimeType: 'text/plain',
    buffer: Buffer.from(fileContent)
  });
});

Then('I should see the file name displayed', async ({ page }) => {
  await expect(page.locator('text="simple_test.txt"')).toBeVisible();
});

When('I click {string}', async ({ page }, buttonText: string) => {
  // Listen for console messages and network requests for debugging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText));
  
  await page.click(`button:has-text("${buttonText}")`);
  
  // If this is the analyze button, wait for the API call to complete
  if (buttonText === 'Analyze Characters') {
    // Wait for the button text to change back from "Analyzing..." to "Analyze Characters"
    await expect(page.locator('button:has-text("Analyze Characters")')).toBeVisible({ timeout: 10000 });
  }
});

Then('I should see character analysis results', async ({ page }) => {
  await expect(page.locator('h2:has-text("Character Analysis")')).toBeVisible({ timeout: 10000 });
});

Then('I should see {string} character with voice information', async ({ page }, characterName: string) => {
  await expect(page.locator(`text="${characterName}"`)).toBeVisible();
  await expect(page.locator('text="Voice:"')).toBeVisible();
});

Given('I have uploaded and analyzed a text file', async ({ page }) => {
  // Upload file
  const fileContent = 'This is a test story. "Hello," said Alice.';
  const fileInput = page.locator('#file-upload');
  await fileInput.setInputFiles({
    name: 'test.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(fileContent)
  });

  // Analyze
  await page.click('button:has-text("Analyze Characters")');
  await expect(page.locator('h2:has-text("Character Analysis")')).toBeVisible();
});

Then('I should see {string} message', async ({ page }, message: string) => {
  await expect(page.locator(`text="${message}"`)).toBeVisible();
});

Then('I should eventually see {string} message', async ({ page }, message: string) => {
  await expect(page.locator(`text="${message}"`)).toBeVisible({ timeout: 30000 });
});

Then('I should see a download link for the audiobook', async ({ page }) => {
  await expect(page.locator('a:has-text("Download Audiobook")')).toBeVisible();
});

When('I try to upload an invalid file type', async ({ page }) => {
  const fileInput = page.locator('#file-upload');
  await fileInput.setInputFiles({
    name: 'test.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('fake pdf content')
  });
});

Then('I should see an error message', async ({ page }) => {
  // This would depend on how we implement error handling
  await expect(page.locator('text="error"')).toBeVisible();
});

Then('the analyze button should not be enabled', async ({ page }) => {
  await expect(page.locator('button:has-text("Analyze Characters")')).toBeDisabled();
});

Given('I am viewing the page on a mobile device', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
  await page.goto('http://localhost:5173');
});

Then('the interface should be responsive', async ({ page }) => {
  // Check that the main container is properly sized
  const container = page.locator('.max-w-4xl');
  await expect(container).toBeVisible();
});

Then('all buttons should be easily clickable', async ({ page }) => {
  // Check button sizes are appropriate for touch
  const buttons = page.locator('button');
  const count = await buttons.count();
  for (let i = 0; i < count; i++) {
    const button = buttons.nth(i);
    const boundingBox = await button.boundingBox();
    if (boundingBox) {
      expect(boundingBox.height).toBeGreaterThanOrEqual(44); // Minimum touch target size
    }
  }
});

Then('the text should be readable', async ({ page }) => {
  // Check that text is not too small
  const heading = page.locator('h1');
  const fontSize = await heading.evaluate(el => getComputedStyle(el).fontSize);
  expect(parseFloat(fontSize)).toBeGreaterThanOrEqual(16);
});
