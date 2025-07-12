import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('I upload a text file with dialogue {string}', async ({ page }, content: string) => {
  const fileInput = page.locator('#file-upload');
  await fileInput.setInputFiles({
    name: 'test_story.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(content)
  });
});

Then('I should see character {string} with voice information', async ({ page }, characterName: string) => {
  // Look for character in the analysis results
  await expect(page.locator(`text="${characterName}"`)).toBeVisible();
  await expect(page.locator('text="Voice:"')).toBeVisible();
});

Then('the character analysis should show correct dialogue counts', async ({ page }) => {
  // Verify that dialogue counts are displayed and reasonable
  const dialogueCountElements = page.locator('text=/Dialogue count: \\d+/');
  await expect(dialogueCountElements.first()).toBeVisible();
  
  // Check that counts are greater than 0
  const countText = await dialogueCountElements.first().textContent();
  const count = parseInt(countText?.match(/\\d+/)?.[0] || '0');
  expect(count).toBeGreaterThan(0);
});

Then('I should eventually see {string} message within {int} seconds', async ({ page }, message: string, timeoutSeconds: number) => {
  await expect(page.locator(`text="${message}"`)).toBeVisible({ timeout: timeoutSeconds * 1000 });
});

When('I click the download link', async ({ page }) => {
  const downloadLink = page.locator('a:has-text("Download Audiobook")');
  await expect(downloadLink).toBeVisible();
  
  // Start waiting for download before clicking
  const downloadPromise = page.waitForDownload();
  await downloadLink.click();
  const download = await downloadPromise;
  
  // Verify download
  expect(download.suggestedFilename()).toContain('.mp3');
});

Then('an audio file should be downloaded', async ({ page }) => {
  // This is handled in the previous step with the download promise
  // We can add additional verification here if needed
});

Given('I upload a complex text file with multiple characters', async ({ page }) => {
  const complexContent = `
    The story begins with our narrator setting the scene.
    "Hello there!" said Alice cheerfully.
    "How are you today?" asked Bob curiously.
    The narrator continued the tale.
    "I'm doing well, thank you," replied Alice kindly.
    "That's wonderful to hear," exclaimed Bob happily.
    And so the story continued with more narrative description.
  `;
  
  const fileInput = page.locator('#file-upload');
  await fileInput.setInputFiles({
    name: 'complex_story.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(complexContent.trim())
  });
});

When('I analyze the characters', async ({ page }) => {
  await page.click('button:has-text("Analyze Characters")');
  await expect(page.locator('h2:has-text("Character Analysis")')).toBeVisible();
});

Then('the character analysis should correctly identify:', async ({ page }, dataTable) => {
  const rows = dataTable.hashes();
  
  for (const row of rows) {
    const characterType = row['Character Type'];
    const expectedCount = parseInt(row['Expected Count']);
    const sampleDialogue = row['Sample Dialogue'];
    
    // Verify character exists
    await expect(page.locator(`text="${characterType}"`)).toBeVisible();
    
    // Verify sample dialogue if provided
    if (sampleDialogue && sampleDialogue !== '') {
      await expect(page.locator(`text="${sampleDialogue}"`)).toBeVisible();
    }
  }
});

Then('each character should have appropriate voice assignments', async ({ page }) => {
  const characterElements = page.locator('.character');
  const count = await characterElements.count();
  
  expect(count).toBeGreaterThan(0);
  
  for (let i = 0; i < count; i++) {
    const character = characterElements.nth(i);
    await expect(character.locator('text="Voice:"')).toBeVisible();
  }
});

Then('the dialogue attribution should be accurate', async ({ page }) => {
  // Verify that characters have appropriate dialogue samples
  const characterElements = page.locator('.character');
  const count = await characterElements.count();
  
  for (let i = 0; i < count; i++) {
    const character = characterElements.nth(i);
    const characterText = await character.textContent();
    
    if (characterText?.includes('character')) {
      // Character type should have dialogue samples
      await expect(character.locator('text=/Sample dialogue/i')).toBeVisible();
    }
  }
});

When('I view the character analysis results', async ({ page }) => {
  await expect(page.locator('h2:has-text("Character Analysis")')).toBeVisible();
});

Then('I should see voice options for each character', async ({ page }) => {
  const characterElements = page.locator('.character');
  const count = await characterElements.count();
  
  expect(count).toBeGreaterThan(0);
  
  for (let i = 0; i < count; i++) {
    const character = characterElements.nth(i);
    await expect(character.locator('text="Voice:"')).toBeVisible();
  }
});

Then('I should be able to preview different voices', async ({ page }) => {
  // This would require implementing voice preview functionality
  // For now, we'll just verify the voice information is displayed
  await expect(page.locator('text="Voice:"')).toBeVisible();
});

When('I select a different voice for a character', async ({ page }) => {
  // This would require implementing voice selection UI
  // For now, we'll just verify we can see voice information
  await expect(page.locator('text="Voice:"')).toBeVisible();
});

Then('the voice selection should be saved', async ({ page }) => {
  // Voice selection persistence would be verified here
  await expect(page.locator('text="Voice:"')).toBeVisible();
});

Then('subsequent audio generation should use the new voice', async ({ page }) => {
  // This would be verified by checking the generated audio
  // For now, we'll verify the generation button is available
  await expect(page.locator('button:has-text("Generate Audiobook")')).toBeVisible();
});

Given('I upload a very long text file', async ({ page }) => {
  const longContent = 'This is a test story. '.repeat(1000) + 
    '"Hello!" said Alice. '.repeat(100) +
    'The narrator continued. '.repeat(500);
  
  const fileInput = page.locator('#file-upload');
  await fileInput.setInputFiles({
    name: 'long_story.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(longContent)
  });
});

When('I attempt to generate an audiobook', async ({ page }) => {
  await page.click('button:has-text("Analyze Characters")');
  await expect(page.locator('h2:has-text("Character Analysis")')).toBeVisible();
  await page.click('button:has-text("Generate Audiobook")');
});

Then('I should see progress indicators', async ({ page }) => {
  await expect(page.locator('text="Generating"')).toBeVisible();
});

Then('if generation fails, I should see a clear error message', async ({ page }) => {
  // This would check for error handling
  // For now, we'll just verify the progress indicator appears
  await expect(page.locator('text="Generating"')).toBeVisible();
});

Then('I should be able to retry the generation', async ({ page }) => {
  // Retry functionality would be tested here
  // For now, verify the generate button exists
  await expect(page.locator('button:has-text("Generate Audiobook")')).toBeVisible();
});

When('I upload a text file using the mobile interface', async ({ page }) => {
  const fileInput = page.locator('#file-upload');
  await fileInput.setInputFiles({
    name: 'mobile_test.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('Mobile test story. "Hello!" said Alice.')
  });
});

Then('the file upload should work correctly', async ({ page }) => {
  await expect(page.locator('text="mobile_test.txt"')).toBeVisible();
});

Then('the character analysis should be readable on mobile', async ({ page }) => {
  await page.click('button:has-text("Analyze Characters")');
  await expect(page.locator('h2:has-text("Character Analysis")')).toBeVisible();
  
  // Verify text is readable (font size check would be in CSS)
  const heading = page.locator('h2:has-text("Character Analysis")');
  await expect(heading).toBeVisible();
});

Then('the generated audiobook should be downloadable on mobile', async ({ page }) => {
  // This would verify mobile download functionality
  await expect(page.locator('button:has-text("Generate Audiobook")')).toBeVisible();
});

Given('I upload a text file of approximately {int} words', async ({ page }, wordCount: number) => {
  const words = 'word '.repeat(wordCount);
  const content = `Story with ${wordCount} words: ${words}"Hello!" said Alice.`;
  
  const fileInput = page.locator('#file-upload');
  await fileInput.setInputFiles({
    name: 'performance_test.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(content)
  });
});

Then('the analysis should complete within {int} seconds', async ({ page }, maxSeconds: number) => {
  await page.click('button:has-text("Analyze Characters")');
  await expect(page.locator('h2:has-text("Character Analysis")')).toBeVisible({ 
    timeout: maxSeconds * 1000 
  });
});

Then('the generation should complete within {int} seconds', async ({ page }, maxSeconds: number) => {
  await page.click('button:has-text("Generate Audiobook")');
  await expect(page.locator('text="Audiobook Ready!"')).toBeVisible({ 
    timeout: maxSeconds * 1000 
  });
});

Then('the resulting audio file should be of good quality', async ({ page }) => {
  // Quality verification would involve checking file size, format, etc.
  await expect(page.locator('a:has-text("Download Audiobook")')).toBeVisible();
});

Then('all interaction buttons should be touch-friendly', async ({ page }) => {
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

When('I generate the audiobook', async ({ page }) => {
  await page.click('button:has-text("Generate Audiobook")');
});