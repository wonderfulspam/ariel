import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

let apiBaseUrl: string;
let lastResponse: any;
let testFileContent: string;
let testFileName: string;

Given('the backend API is running on {string}', async ({ page }, baseUrl: string) => {
  apiBaseUrl = baseUrl;
  // Verify API is actually running
  const response = await page.request.get(`${apiBaseUrl}/health`);
  expect(response.status()).toBe(200);
});

When('I make a GET request to {string}', async ({ page }, endpoint: string) => {
  const response = await page.request.get(`${apiBaseUrl}${endpoint}`);
  lastResponse = {
    status: response.status(),
    body: await response.text(),
    json: response.status() === 200 ? await response.json().catch(() => null) : null
  };
});

When('I make a POST request to {string} without a file', async ({ page }, endpoint: string) => {
  const response = await page.request.post(`${apiBaseUrl}${endpoint}`, {
    multipart: {}
  });
  lastResponse = {
    status: response.status(),
    body: await response.text(),
    json: response.status() < 500 ? await response.json().catch(() => null) : null
  };
});

Given('I have a text file with content {string}', async ({ page }, content: string) => {
  testFileContent = content;
  testFileName = 'test.txt';
});

Given('I have a PDF file', async ({ page }) => {
  testFileContent = '%PDF-1.4 fake pdf content';
  testFileName = 'test.pdf';
});

When('I upload the file to {string}', async ({ page }, endpoint: string) => {
  const response = await page.request.post(`${apiBaseUrl}${endpoint}`, {
    multipart: {
      file: {
        name: testFileName,
        mimeType: testFileName.endsWith('.pdf') ? 'application/pdf' : 'text/plain',
        buffer: Buffer.from(testFileContent)
      }
    }
  });
  
  lastResponse = {
    status: response.status(),
    body: await response.text(),
    json: response.status() < 500 ? await response.json().catch(() => null) : null,
    headers: response.headers()
  };
  
  // For audio generation, we need to handle binary response
  if (endpoint === '/generate' && response.status() === 200) {
    lastResponse.buffer = await response.body();
    lastResponse.size = lastResponse.buffer.length;
  }
});

Then('the response status should be {int}', async ({ page }, expectedStatus: number) => {
  expect(lastResponse.status).toBe(expectedStatus);
});

Then('the response should contain {string}', async ({ page }, expectedText: string) => {
  if (lastResponse.json) {
    const responseStr = JSON.stringify(lastResponse.json);
    expect(responseStr).toContain(expectedText);
  } else {
    expect(lastResponse.body).toContain(expectedText);
  }
});

Then('the response should contain at least {int} voices', async ({ page }, minCount: number) => {
  expect(lastResponse.json).toBeTruthy();
  expect(lastResponse.json.voices).toBeTruthy();
  expect(Array.isArray(lastResponse.json.voices)).toBe(true);
  expect(lastResponse.json.voices.length).toBeGreaterThanOrEqual(minCount);
});

Then('the characters array should contain a {string}', async ({ page }, characterType: string) => {
  expect(lastResponse.json).toBeTruthy();
  expect(lastResponse.json.characters).toBeTruthy();
  expect(Array.isArray(lastResponse.json.characters)).toBe(true);
  
  const hasCharacterType = lastResponse.json.characters.some((char: any) => 
    char.type === characterType || char.name === characterType
  );
  expect(hasCharacterType).toBe(true);
});

Then('the character should have sample dialogue {string}', async ({ page }, expectedDialogue: string) => {
  expect(lastResponse.json).toBeTruthy();
  expect(lastResponse.json.characters).toBeTruthy();
  
  const characterWithDialogue = lastResponse.json.characters.find((char: any) =>
    char.sample_dialogue && char.sample_dialogue.some((dialogue: string) =>
      dialogue.includes(expectedDialogue.replace(/[!"]/g, ''))
    )
  );
  expect(characterWithDialogue).toBeTruthy();
});

Then('the response should be a valid audio file', async ({ page }) => {
  expect(lastResponse.status).toBe(200);
  expect(lastResponse.headers['content-type']).toContain('audio');
  expect(lastResponse.buffer).toBeTruthy();
});

Then('the audio file should be larger than {int} bytes', async ({ page }, minSize: number) => {
  expect(lastResponse.size).toBeGreaterThan(minSize);
});

Then('the response should contain error information', async ({ page }) => {
  expect(lastResponse.json).toBeTruthy();
  expect(lastResponse.json.detail || lastResponse.json.error).toBeTruthy();
});

Then('the response should contain English voices', async ({ page }) => {
  expect(lastResponse.json).toBeTruthy();
  expect(lastResponse.json.voices).toBeTruthy();
  
  const englishVoices = lastResponse.json.voices.filter((voice: any) =>
    voice.language === 'en' || voice.locale.startsWith('en-')
  );
  expect(englishVoices.length).toBeGreaterThan(10);
});

Then('the response should contain voices with different genders', async ({ page }) => {
  expect(lastResponse.json).toBeTruthy();
  expect(lastResponse.json.voices).toBeTruthy();
  
  const genders = new Set(lastResponse.json.voices.map((voice: any) => voice.gender));
  expect(genders.has('Male')).toBe(true);
  expect(genders.has('Female')).toBe(true);
});

Then('each voice should have required fields {string}, {string}, {string}, {string}', 
  async ({ page }, field1: string, field2: string, field3: string, field4: string) => {
    expect(lastResponse.json).toBeTruthy();
    expect(lastResponse.json.voices).toBeTruthy();
    
    const requiredFields = [field1, field2, field3, field4];
    const sampleVoice = lastResponse.json.voices[0];
    
    requiredFields.forEach(field => {
      expect(sampleVoice).toHaveProperty(field);
      expect(sampleVoice[field]).toBeTruthy();
    });
  }
);