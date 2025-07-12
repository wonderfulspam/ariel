Feature: Audiobook Converter Web Interface
  As a user
  I want to convert text files into audiobooks
  So that I can listen to stories with different character voices

  Background:
    Given the backend API is running
    And I am on the audiobook converter page

  Scenario: Upload and analyze a text file
    When I upload a text file "simple_test.txt"
    Then I should see the file name displayed
    When I click "Analyze Characters"
    Then I should see character analysis results
    And I should see "narrator" character with voice information

  Scenario: Generate audiobook from analyzed text
    Given I have uploaded and analyzed a text file
    When I click "Generate Audiobook"
    Then I should see "Generating Audiobook..." message
    And I should eventually see "Audiobook Ready!" message
    And I should see a download link for the audiobook

  Scenario: Handle upload errors gracefully
    When I try to upload an invalid file type
    Then I should see an error message
    And the analyze button should not be enabled

  Scenario: Responsive design works on mobile
    Given I am viewing the page on a mobile device
    Then the interface should be responsive
    And all buttons should be easily clickable
    And the text should be readable
