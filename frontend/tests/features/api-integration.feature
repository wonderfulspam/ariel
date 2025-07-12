Feature: Backend API Integration
  As a developer
  I want to ensure the backend API is working correctly
  So that the frontend can reliably communicate with the audiobook service

  Background:
    Given the backend API is running on "http://localhost:8000"

  Scenario: Health check endpoint responds correctly
    When I make a GET request to "/health"
    Then the response status should be 200
    And the response should contain "healthy"
    And the response should contain "ariel-backend"

  Scenario: Voice listing API works correctly
    When I make a GET request to "/voices"
    Then the response status should be 200
    And the response should contain "voices"
    And the response should contain at least 100 voices

  Scenario: Text analysis API processes simple text
    Given I have a text file with content "Hello world! This is a test."
    When I upload the file to "/analyze"
    Then the response status should be 200
    And the response should contain "characters"
    And the response should contain "segments"
    And the response should contain "input_length"
    And the characters array should contain a "narrator"

  Scenario: Text analysis API processes dialogue correctly
    Given I have a text file with content "The story begins. \"Hello!\" said Alice. \"Goodbye!\" replied Bob."
    When I upload the file to "/analyze"
    Then the response status should be 200
    And the characters array should contain a "narrator"
    And the characters array should contain a "character"
    And the character should have sample dialogue "Hello!"

  Scenario: Audio generation API creates valid audio files
    Given I have a text file with content "Short test for audio generation."
    When I upload the file to "/generate"
    Then the response status should be 200
    And the response should be a valid audio file
    And the audio file should be larger than 1000 bytes

  Scenario: API handles invalid file types gracefully
    Given I have a PDF file
    When I upload the file to "/analyze"
    Then the response status should be 400
    And the response should contain "Only .txt files are supported"

  Scenario: API handles empty requests gracefully
    When I make a POST request to "/analyze" without a file
    Then the response status should be 422
    And the response should contain error information

  Scenario: Voice filtering works correctly
    When I make a GET request to "/voices"
    Then the response should contain English voices
    And the response should contain voices with different genders
    And each voice should have required fields "id", "name", "gender", "locale"