Feature: End-to-End Audiobook Creation Workflow
  As a user
  I want to create an audiobook from start to finish
  So that I can convert my text stories into audio format

  Background:
    Given the backend API is running
    And I am on the audiobook converter page

  Scenario: Complete audiobook creation workflow
    When I upload a text file with dialogue "Test story. \"Hello there!\" said Alice. \"How are you?\" asked Bob."
    Then I should see the file name displayed
    When I click "Analyze Characters"
    Then I should see character analysis results
    And I should see character "narrator" with voice information
    And I should see character "character" with voice information
    And the character analysis should show correct dialogue counts
    When I click "Generate Audiobook"
    Then I should see "Generating Audiobook..." message
    And I should eventually see "Audiobook Ready!" message within 30 seconds
    And I should see a download link for the audiobook
    When I click the download link
    Then an audio file should be downloaded

  Scenario: Character analysis accuracy verification
    Given I upload a complex text file with multiple characters
    When I analyze the characters
    Then the character analysis should correctly identify:
      | Character Type | Expected Count | Sample Dialogue |
      | narrator       | 3             | The story begins |
      | character      | 4             | Hello            |
    And each character should have appropriate voice assignments
    And the dialogue attribution should be accurate

  Scenario: Voice customization workflow
    Given I have uploaded and analyzed a text file
    When I view the character analysis results
    Then I should see voice options for each character
    And I should be able to preview different voices
    When I select a different voice for a character
    Then the voice selection should be saved
    And subsequent audio generation should use the new voice

  Scenario: Error handling during audio generation
    Given I upload a very long text file
    When I attempt to generate an audiobook
    Then I should see progress indicators
    And if generation fails, I should see a clear error message
    And I should be able to retry the generation

  Scenario: Mobile-responsive audiobook creation
    Given I am viewing the page on a mobile device
    When I upload a text file using the mobile interface
    Then the file upload should work correctly
    And the character analysis should be readable on mobile
    And all interaction buttons should be touch-friendly
    And the generated audiobook should be downloadable on mobile

  Scenario: Performance validation for reasonable file sizes
    Given I upload a text file of approximately 5000 words
    When I analyze the characters
    Then the analysis should complete within 10 seconds
    When I generate the audiobook
    Then the generation should complete within 60 seconds
    And the resulting audio file should be of good quality