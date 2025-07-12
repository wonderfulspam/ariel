// Generated from: tests/features/error-handling.feature
import { test } from "playwright-bdd";

test.describe('Error Handling and Resilience', () => {

  test.beforeEach('Background', async ({ Given, page }) => {
    await Given('I am on the Ariel audiobook converter page', null, { page }); 
  });
  
  test('File validation errors are displayed properly', async ({ When, page, Then, And }) => { 
    await When('I upload an invalid file type "test.pdf"', null, { page }); 
    await Then('I should see error message "Invalid file type"', null, { page }); 
    await And('I should see error details "Please select a .txt file"', null, { page }); 
  });

  test('Large file rejection', async ({ When, page, Then, And }) => { 
    await When('I upload a large file exceeding 10MB', null, { page }); 
    await Then('I should see error message "File too large"', null, { page }); 
    await And('I should see error details "Maximum allowed size is 10MB"', null, { page }); 
  });

  test('Empty file handling', async ({ When, page, Then, And }) => { 
    await When('I upload an empty text file', null, { page }); 
    await Then('I should see error message "Empty file"', null, { page }); 
    await And('I should see error details "appears to be empty"', null, { page }); 
  });

  test('Analysis service errors are handled gracefully', async ({ Given, page, When, And, Then }) => { 
    await Given('I have uploaded a valid text file', null, { page }); 
    await When('the analysis service returns a server error', null, { page }); 
    await And('I click "Analyze Characters"', null, { page }); 
    await Then('I should see error message "Server error"', null, { page }); 
    await And('I should see error details "server encountered an error"', null, { page }); 
  });

  test('Analysis network failures are handled', async ({ Given, page, When, And, Then }) => { 
    await Given('I have uploaded a valid text file', null, { page }); 
    await When('the analysis service is unreachable', null, { page }); 
    await And('I click "Analyze Characters"', null, { page }); 
    await Then('I should see error message "Connection failed"', null, { page }); 
    await And('I should see error details "Unable to connect to the server"', null, { page }); 
  });

  test('Analysis timeout handling', async ({ Given, page, When, And, Then }) => { 
    await Given('I have uploaded a valid text file', null, { page }); 
    await When('the analysis service times out', null, { page }); 
    await And('I click "Analyze Characters"', null, { page }); 
    await Then('I should see error message "Request timeout"', null, { page }); 
    await And('I should see error details "took too long to complete"', null, { page }); 
  });

  test('Audio generation TTS service errors', async ({ Given, page, When, And, Then }) => { 
    await Given('I have successfully analyzed a text file', null, { page }); 
    await When('the TTS service is unavailable', null, { page }); 
    await And('I click "Generate Audiobook"', null, { page }); 
    await Then('I should see warning message "Text-to-speech service error"', null, { page }); 
    await And('I should see error details "currently unavailable"', null, { page }); 
  });

  test('Audio generation service overload', async ({ Given, page, When, And, Then }) => { 
    await Given('I have successfully analyzed a text file', null, { page }); 
    await When('the audio service is overloaded', null, { page }); 
    await And('I click "Generate Audiobook"', null, { page }); 
    await Then('I should see error message "Service temporarily unavailable"', null, { page }); 
    await And('I should see error details "temporarily overloaded"', null, { page }); 
  });

  test('Audio generation timeout handling', async ({ Given, page, When, And, Then }) => { 
    await Given('I have successfully analyzed a text file', null, { page }); 
    await When('the audio generation times out', null, { page }); 
    await And('I click "Generate Audiobook"', null, { page }); 
    await Then('I should see warning message "Generation timeout"', null, { page }); 
    await And('I should see error details "took too long to complete"', null, { page }); 
  });

  test('Empty audio file handling', async ({ Given, page, When, And, Then }) => { 
    await Given('I have successfully analyzed a text file', null, { page }); 
    await When('the audio service returns empty audio', null, { page }); 
    await And('I click "Generate Audiobook"', null, { page }); 
    await Then('I should see error message "Empty audio file"', null, { page }); 
    await And('I should see error details "generated audio file is empty"', null, { page }); 
  });

  test('Error dismissal functionality', async ({ Given, page, When, Then }) => { 
    await Given('I have an error displayed', null, { page }); 
    await When('I click the dismiss button', null, { page }); 
    await Then('the error message should disappear', null, { page }); 
  });

  test('Error clearing on successful retry', async ({ Given, page, When, Then }) => { 
    await Given('I have an error displayed from a failed operation', null, { page }); 
    await When('I retry the operation successfully', null, { page }); 
    await Then('the error message should be cleared automatically', null, { page }); 
  });

  test('Multiple error types are distinguished', async ({ When, page, Then }) => { 
    await When('I encounter a server error', null, { page }); 
    await Then('I should see a red error notification', null, { page }); 
    await When('I encounter a service warning', null, { page }); 
    await Then('I should see a yellow warning notification', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use('tests/features/error-handling.feature'),
  $bddFileData: ({}, use) => use(bddFileData),
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":6,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am on the Ariel audiobook converter page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":7,"keywordType":"Action","textWithKeyword":"When I upload an invalid file type \"test.pdf\"","stepMatchArguments":[{"group":{"start":30,"value":"\"test.pdf\"","children":[{"start":31,"value":"test.pdf","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":12,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"Then I should see error message \"Invalid file type\"","stepMatchArguments":[{"group":{"start":27,"value":"\"Invalid file type\"","children":[{"start":28,"value":"Invalid file type","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"And I should see error details \"Please select a .txt file\"","stepMatchArguments":[{"group":{"start":27,"value":"\"Please select a .txt file\"","children":[{"start":28,"value":"Please select a .txt file","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":16,"pickleLine":11,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am on the Ariel audiobook converter page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":12,"keywordType":"Action","textWithKeyword":"When I upload a large file exceeding 10MB","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"Then I should see error message \"File too large\"","stepMatchArguments":[{"group":{"start":27,"value":"\"File too large\"","children":[{"start":28,"value":"File too large","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":19,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"And I should see error details \"Maximum allowed size is 10MB\"","stepMatchArguments":[{"group":{"start":27,"value":"\"Maximum allowed size is 10MB\"","children":[{"start":28,"value":"Maximum allowed size is 10MB","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":22,"pickleLine":16,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am on the Ariel audiobook converter page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":17,"keywordType":"Action","textWithKeyword":"When I upload an empty text file","stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"Then I should see error message \"Empty file\"","stepMatchArguments":[{"group":{"start":27,"value":"\"Empty file\"","children":[{"start":28,"value":"Empty file","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":25,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"And I should see error details \"appears to be empty\"","stepMatchArguments":[{"group":{"start":27,"value":"\"appears to be empty\"","children":[{"start":28,"value":"appears to be empty","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":28,"pickleLine":21,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am on the Ariel audiobook converter page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":29,"gherkinStepLine":22,"keywordType":"Context","textWithKeyword":"Given I have uploaded a valid text file","stepMatchArguments":[]},{"pwStepLine":30,"gherkinStepLine":23,"keywordType":"Action","textWithKeyword":"When the analysis service returns a server error","stepMatchArguments":[]},{"pwStepLine":31,"gherkinStepLine":24,"keywordType":"Action","textWithKeyword":"And I click \"Analyze Characters\"","stepMatchArguments":[{"group":{"start":8,"value":"\"Analyze Characters\"","children":[{"start":9,"value":"Analyze Characters","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":32,"gherkinStepLine":25,"keywordType":"Outcome","textWithKeyword":"Then I should see error message \"Server error\"","stepMatchArguments":[{"group":{"start":27,"value":"\"Server error\"","children":[{"start":28,"value":"Server error","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":33,"gherkinStepLine":26,"keywordType":"Outcome","textWithKeyword":"And I should see error details \"server encountered an error\"","stepMatchArguments":[{"group":{"start":27,"value":"\"server encountered an error\"","children":[{"start":28,"value":"server encountered an error","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":36,"pickleLine":28,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am on the Ariel audiobook converter page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":37,"gherkinStepLine":29,"keywordType":"Context","textWithKeyword":"Given I have uploaded a valid text file","stepMatchArguments":[]},{"pwStepLine":38,"gherkinStepLine":30,"keywordType":"Action","textWithKeyword":"When the analysis service is unreachable","stepMatchArguments":[]},{"pwStepLine":39,"gherkinStepLine":31,"keywordType":"Action","textWithKeyword":"And I click \"Analyze Characters\"","stepMatchArguments":[{"group":{"start":8,"value":"\"Analyze Characters\"","children":[{"start":9,"value":"Analyze Characters","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":40,"gherkinStepLine":32,"keywordType":"Outcome","textWithKeyword":"Then I should see error message \"Connection failed\"","stepMatchArguments":[{"group":{"start":27,"value":"\"Connection failed\"","children":[{"start":28,"value":"Connection failed","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":41,"gherkinStepLine":33,"keywordType":"Outcome","textWithKeyword":"And I should see error details \"Unable to connect to the server\"","stepMatchArguments":[{"group":{"start":27,"value":"\"Unable to connect to the server\"","children":[{"start":28,"value":"Unable to connect to the server","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":44,"pickleLine":35,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am on the Ariel audiobook converter page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":45,"gherkinStepLine":36,"keywordType":"Context","textWithKeyword":"Given I have uploaded a valid text file","stepMatchArguments":[]},{"pwStepLine":46,"gherkinStepLine":37,"keywordType":"Action","textWithKeyword":"When the analysis service times out","stepMatchArguments":[]},{"pwStepLine":47,"gherkinStepLine":38,"keywordType":"Action","textWithKeyword":"And I click \"Analyze Characters\"","stepMatchArguments":[{"group":{"start":8,"value":"\"Analyze Characters\"","children":[{"start":9,"value":"Analyze Characters","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":48,"gherkinStepLine":39,"keywordType":"Outcome","textWithKeyword":"Then I should see error message \"Request timeout\"","stepMatchArguments":[{"group":{"start":27,"value":"\"Request timeout\"","children":[{"start":28,"value":"Request timeout","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":49,"gherkinStepLine":40,"keywordType":"Outcome","textWithKeyword":"And I should see error details \"took too long to complete\"","stepMatchArguments":[{"group":{"start":27,"value":"\"took too long to complete\"","children":[{"start":28,"value":"took too long to complete","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":52,"pickleLine":42,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am on the Ariel audiobook converter page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":53,"gherkinStepLine":43,"keywordType":"Context","textWithKeyword":"Given I have successfully analyzed a text file","stepMatchArguments":[]},{"pwStepLine":54,"gherkinStepLine":44,"keywordType":"Action","textWithKeyword":"When the TTS service is unavailable","stepMatchArguments":[]},{"pwStepLine":55,"gherkinStepLine":45,"keywordType":"Action","textWithKeyword":"And I click \"Generate Audiobook\"","stepMatchArguments":[{"group":{"start":8,"value":"\"Generate Audiobook\"","children":[{"start":9,"value":"Generate Audiobook","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":56,"gherkinStepLine":46,"keywordType":"Outcome","textWithKeyword":"Then I should see warning message \"Text-to-speech service error\"","stepMatchArguments":[{"group":{"start":29,"value":"\"Text-to-speech service error\"","children":[{"start":30,"value":"Text-to-speech service error","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":57,"gherkinStepLine":47,"keywordType":"Outcome","textWithKeyword":"And I should see error details \"currently unavailable\"","stepMatchArguments":[{"group":{"start":27,"value":"\"currently unavailable\"","children":[{"start":28,"value":"currently unavailable","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":60,"pickleLine":49,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am on the Ariel audiobook converter page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":61,"gherkinStepLine":50,"keywordType":"Context","textWithKeyword":"Given I have successfully analyzed a text file","stepMatchArguments":[]},{"pwStepLine":62,"gherkinStepLine":51,"keywordType":"Action","textWithKeyword":"When the audio service is overloaded","stepMatchArguments":[]},{"pwStepLine":63,"gherkinStepLine":52,"keywordType":"Action","textWithKeyword":"And I click \"Generate Audiobook\"","stepMatchArguments":[{"group":{"start":8,"value":"\"Generate Audiobook\"","children":[{"start":9,"value":"Generate Audiobook","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":64,"gherkinStepLine":53,"keywordType":"Outcome","textWithKeyword":"Then I should see error message \"Service temporarily unavailable\"","stepMatchArguments":[{"group":{"start":27,"value":"\"Service temporarily unavailable\"","children":[{"start":28,"value":"Service temporarily unavailable","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":65,"gherkinStepLine":54,"keywordType":"Outcome","textWithKeyword":"And I should see error details \"temporarily overloaded\"","stepMatchArguments":[{"group":{"start":27,"value":"\"temporarily overloaded\"","children":[{"start":28,"value":"temporarily overloaded","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":68,"pickleLine":56,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am on the Ariel audiobook converter page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":69,"gherkinStepLine":57,"keywordType":"Context","textWithKeyword":"Given I have successfully analyzed a text file","stepMatchArguments":[]},{"pwStepLine":70,"gherkinStepLine":58,"keywordType":"Action","textWithKeyword":"When the audio generation times out","stepMatchArguments":[]},{"pwStepLine":71,"gherkinStepLine":59,"keywordType":"Action","textWithKeyword":"And I click \"Generate Audiobook\"","stepMatchArguments":[{"group":{"start":8,"value":"\"Generate Audiobook\"","children":[{"start":9,"value":"Generate Audiobook","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":72,"gherkinStepLine":60,"keywordType":"Outcome","textWithKeyword":"Then I should see warning message \"Generation timeout\"","stepMatchArguments":[{"group":{"start":29,"value":"\"Generation timeout\"","children":[{"start":30,"value":"Generation timeout","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":73,"gherkinStepLine":61,"keywordType":"Outcome","textWithKeyword":"And I should see error details \"took too long to complete\"","stepMatchArguments":[{"group":{"start":27,"value":"\"took too long to complete\"","children":[{"start":28,"value":"took too long to complete","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":76,"pickleLine":63,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am on the Ariel audiobook converter page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":77,"gherkinStepLine":64,"keywordType":"Context","textWithKeyword":"Given I have successfully analyzed a text file","stepMatchArguments":[]},{"pwStepLine":78,"gherkinStepLine":65,"keywordType":"Action","textWithKeyword":"When the audio service returns empty audio","stepMatchArguments":[]},{"pwStepLine":79,"gherkinStepLine":66,"keywordType":"Action","textWithKeyword":"And I click \"Generate Audiobook\"","stepMatchArguments":[{"group":{"start":8,"value":"\"Generate Audiobook\"","children":[{"start":9,"value":"Generate Audiobook","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":80,"gherkinStepLine":67,"keywordType":"Outcome","textWithKeyword":"Then I should see error message \"Empty audio file\"","stepMatchArguments":[{"group":{"start":27,"value":"\"Empty audio file\"","children":[{"start":28,"value":"Empty audio file","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":81,"gherkinStepLine":68,"keywordType":"Outcome","textWithKeyword":"And I should see error details \"generated audio file is empty\"","stepMatchArguments":[{"group":{"start":27,"value":"\"generated audio file is empty\"","children":[{"start":28,"value":"generated audio file is empty","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":84,"pickleLine":70,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am on the Ariel audiobook converter page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":85,"gherkinStepLine":71,"keywordType":"Context","textWithKeyword":"Given I have an error displayed","stepMatchArguments":[]},{"pwStepLine":86,"gherkinStepLine":72,"keywordType":"Action","textWithKeyword":"When I click the dismiss button","stepMatchArguments":[]},{"pwStepLine":87,"gherkinStepLine":73,"keywordType":"Outcome","textWithKeyword":"Then the error message should disappear","stepMatchArguments":[]}]},
  {"pwTestLine":90,"pickleLine":75,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am on the Ariel audiobook converter page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":91,"gherkinStepLine":76,"keywordType":"Context","textWithKeyword":"Given I have an error displayed from a failed operation","stepMatchArguments":[]},{"pwStepLine":92,"gherkinStepLine":77,"keywordType":"Action","textWithKeyword":"When I retry the operation successfully","stepMatchArguments":[]},{"pwStepLine":93,"gherkinStepLine":78,"keywordType":"Outcome","textWithKeyword":"Then the error message should be cleared automatically","stepMatchArguments":[]}]},
  {"pwTestLine":96,"pickleLine":80,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am on the Ariel audiobook converter page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":97,"gherkinStepLine":81,"keywordType":"Action","textWithKeyword":"When I encounter a server error","stepMatchArguments":[]},{"pwStepLine":98,"gherkinStepLine":82,"keywordType":"Outcome","textWithKeyword":"Then I should see a red error notification","stepMatchArguments":[]},{"pwStepLine":99,"gherkinStepLine":83,"keywordType":"Action","textWithKeyword":"When I encounter a service warning","stepMatchArguments":[]},{"pwStepLine":100,"gherkinStepLine":84,"keywordType":"Outcome","textWithKeyword":"Then I should see a yellow warning notification","stepMatchArguments":[]}]},
]; // bdd-data-end