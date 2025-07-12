import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { mockAnalysisError, mockGenerationError, resetMocks } from '../mock-server';

const { Given, When, Then } = createBdd();

// Mock file creation helpers
const createMockFile = (name: string, content: string, size?: number) => {
  const actualSize = size || content.length;
  return {
    name,
    mimeType: name.endsWith('.txt') ? 'text/plain' : 'application/pdf',
    buffer: Buffer.alloc(actualSize, content)
  };
};

Given('I am on the Ariel audiobook converter page', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.locator('h1:has-text("Ariel Audiobook Converter")')).toBeVisible();
});

Given('I have uploaded a valid text file', async ({ page }) => {
  const fileInput = page.locator('#file-upload');
  await fileInput.setInputFiles(createMockFile('test.txt', 'This is a test story with some content.'));
  await expect(page.locator('text="test.txt"')).toBeVisible();
});

Given('I have successfully analyzed a text file', async ({ page }) => {
  // First upload a file
  const fileInput = page.locator('#file-upload');
  await fileInput.setInputFiles(createMockFile('test.txt', 'This is a test story with dialogue. "Hello!" said Alice.'));
  
  // Click analyze and wait for results
  await page.click('button:has-text("Analyze Characters")');
  await expect(page.locator('h2:has-text("Character Analysis")')).toBeVisible();
});

Given('I have an error displayed', async ({ page }) => {
  // Trigger an error by uploading wrong file type
  const fileInput = page.locator('#file-upload');
  await fileInput.setInputFiles(createMockFile('test.pdf', 'fake pdf content'));
  await expect(page.locator('[class*="bg-red-50"]')).toBeVisible();
});

Given('I have an error displayed from a failed operation', async ({ page }) => {
  // Upload valid file first
  const fileInput = page.locator('#file-upload');
  await fileInput.setInputFiles(createMockFile('test.txt', 'Valid content'));
  
  // Mock a server error for analysis
  mockAnalysisError('server_error');
  
  // Trigger the error
  await page.click('button:has-text("Analyze Characters")');
  await expect(page.locator('[class*="bg-red-50"]')).toBeVisible();
});

When('I upload an invalid file type {string}', async ({ page }, filename: string) => {
  const fileInput = page.locator('#file-upload');
  await fileInput.setInputFiles(createMockFile(filename, 'fake content'));
});

When('I upload a large file exceeding 10MB', async ({ page }) => {
  const fileInput = page.locator('#file-upload');
  const largeSize = 11 * 1024 * 1024; // 11MB
  await fileInput.setInputFiles(createMockFile('large.txt', 'content', largeSize));
});

When('I upload an empty text file', async ({ page }) => {
  const fileInput = page.locator('#file-upload');
  await fileInput.setInputFiles(createMockFile('empty.txt', '', 0));
});

When('the analysis service returns a server error', async ({ page }) => {
  mockAnalysisError('server_error');
});

When('the analysis service is unreachable', async ({ page }) => {
  mockAnalysisError('network');
});

When('the analysis service times out', async ({ page }) => {
  mockAnalysisError('timeout');
});

When('the TTS service is unavailable', async ({ page }) => {
  mockGenerationError('tts_error');
});

When('the audio service is overloaded', async ({ page }) => {
  mockGenerationError('default'); // Will return 400 by default
});

When('the audio generation times out', async ({ page }) => {
  mockGenerationError('timeout');
});

When('the audio service returns empty audio', async ({ page }) => {
  mockGenerationError('empty_audio');
});

// Note: 'I click {string}' step is already defined in audiobook-converter.steps.ts

When('I click the dismiss button', async ({ page }) => {
  await page.click('button[aria-label="Dismiss error"]');
});

When('I retry the operation successfully', async ({ page }) => {
  // Reset mocks to allow success
  resetMocks();
  
  // Retry the analyze operation
  await page.click('button:has-text("Analyze Characters")');
  await expect(page.locator('h2:has-text("Character Analysis")')).toBeVisible();
});

When('I encounter a server error', async ({ page }) => {
  // Upload valid file and trigger server error
  const fileInput = page.locator('#file-upload');
  await fileInput.setInputFiles(createMockFile('test.txt', 'Valid content'));
  mockAnalysisError('server_error');
  await page.click('button:has-text("Analyze Characters")');
});

When('I encounter a service warning', async ({ page }) => {
  // First get to analysis results
  const fileInput = page.locator('#file-upload');
  await fileInput.setInputFiles(createMockFile('test.txt', 'Valid content with dialogue. "Hello!" said Alice.'));
  await page.click('button:has-text("Analyze Characters")');
  await expect(page.locator('h2:has-text("Character Analysis")')).toBeVisible();
  
  // Now trigger TTS warning
  mockGenerationError('tts_error');
  await page.click('button:has-text("Generate Audiobook")');
});

Then('I should see error message {string}', async ({ page }, errorMessage: string) => {
  await expect(page.locator(`text="${errorMessage}"`)).toBeVisible();
});

Then('I should see warning message {string}', async ({ page }, warningMessage: string) => {
  await expect(page.locator(`text="${warningMessage}"`)).toBeVisible();
});

Then('I should see error details {string}', async ({ page }, errorDetails: string) => {
  await expect(page.locator(`text=${errorDetails}`)).toBeVisible();
});

Then('the error message should disappear', async ({ page }) => {
  await expect(page.locator('[class*="bg-red-50"]')).not.toBeVisible();
  await expect(page.locator('[class*="bg-yellow-50"]')).not.toBeVisible();
});

Then('the error message should be cleared automatically', async ({ page }) => {
  await expect(page.locator('[class*="bg-red-50"]')).not.toBeVisible();
});

Then('I should see a red error notification', async ({ page }) => {
  await expect(page.locator('[class*="bg-red-50"]')).toBeVisible();
});

Then('I should see a yellow warning notification', async ({ page }) => {
  await expect(page.locator('[class*="bg-yellow-50"]')).toBeVisible();
});

// Cleanup after each test
When('I cleanup test state', async ({ page }) => {
  resetMocks();
});