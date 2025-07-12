Feature: Error Handling and Resilience

  Background:
    Given I am on the Ariel audiobook converter page

  Scenario: File validation errors are displayed properly
    When I upload an invalid file type "test.pdf"
    Then I should see error message "Invalid file type"
    And I should see error details "Please select a .txt file"

  Scenario: Large file rejection
    When I upload a large file exceeding 10MB
    Then I should see error message "File too large"
    And I should see error details "Maximum allowed size is 10MB"

  Scenario: Empty file handling
    When I upload an empty text file
    Then I should see error message "Empty file"
    And I should see error details "appears to be empty"

  Scenario: Analysis service errors are handled gracefully
    Given I have uploaded a valid text file
    When the analysis service returns a server error
    And I click "Analyze Characters"
    Then I should see error message "Server error"
    And I should see error details "server encountered an error"

  Scenario: Analysis network failures are handled
    Given I have uploaded a valid text file
    When the analysis service is unreachable
    And I click "Analyze Characters"
    Then I should see error message "Connection failed"
    And I should see error details "Unable to connect to the server"

  Scenario: Analysis timeout handling
    Given I have uploaded a valid text file
    When the analysis service times out
    And I click "Analyze Characters"
    Then I should see error message "Request timeout"
    And I should see error details "took too long to complete"

  Scenario: Audio generation TTS service errors
    Given I have successfully analyzed a text file
    When the TTS service is unavailable
    And I click "Generate Audiobook"
    Then I should see warning message "Text-to-speech service error"
    And I should see error details "currently unavailable"

  Scenario: Audio generation service overload
    Given I have successfully analyzed a text file
    When the audio service is overloaded
    And I click "Generate Audiobook"
    Then I should see error message "Service temporarily unavailable"
    And I should see error details "temporarily overloaded"

  Scenario: Audio generation timeout handling
    Given I have successfully analyzed a text file
    When the audio generation times out
    And I click "Generate Audiobook"
    Then I should see warning message "Generation timeout"
    And I should see error details "took too long to complete"

  Scenario: Empty audio file handling
    Given I have successfully analyzed a text file
    When the audio service returns empty audio
    And I click "Generate Audiobook"
    Then I should see error message "Empty audio file"
    And I should see error details "generated audio file is empty"

  Scenario: Error dismissal functionality
    Given I have an error displayed
    When I click the dismiss button
    Then the error message should disappear

  Scenario: Error clearing on successful retry
    Given I have an error displayed from a failed operation
    When I retry the operation successfully
    Then the error message should be cleared automatically

  Scenario: Multiple error types are distinguished
    When I encounter a server error
    Then I should see a red error notification
    When I encounter a service warning
    Then I should see a yellow warning notification