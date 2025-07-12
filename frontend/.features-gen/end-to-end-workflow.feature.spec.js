// Generated from: tests/features/end-to-end-workflow.feature
import { test } from "playwright-bdd";

test.describe('End-to-End Audiobook Creation Workflow', () => {

  test.beforeEach('Background', async ({ Given, page, And }) => {
    await Given('the backend API is running', null, { page }); 
    await And('I am on the audiobook converter page', null, { page }); 
  });
  
  test('Complete audiobook creation workflow', async ({ When, page, Then, And }) => { 
    await When('I upload a text file with dialogue "Test story. \\"Hello there!\\" said Alice. \\"How are you?\\" asked Bob."', null, { page }); 
    await Then('I should see the file name displayed', null, { page }); 
    await When('I click "Analyze Characters"', null, { page }); 
    await Then('I should see character analysis results', null, { page }); 
    await And('I should see character "narrator" with voice information', null, { page }); 
    await And('I should see character "character" with voice information', null, { page }); 
    await And('the character analysis should show correct dialogue counts', null, { page }); 
    await When('I click "Generate Audiobook"', null, { page }); 
    await Then('I should see "Generating Audiobook..." message', null, { page }); 
    await And('I should eventually see "Audiobook Ready!" message within 30 seconds', null, { page }); 
    await And('I should see a download link for the audiobook', null, { page }); 
    await When('I click the download link', null, { page }); 
    await Then('an audio file should be downloaded', null, { page }); 
  });

  test('Character analysis accuracy verification', async ({ Given, page, When, Then, And }) => { 
    await Given('I upload a complex text file with multiple characters', null, { page }); 
    await When('I analyze the characters', null, { page }); 
    await Then('the character analysis should correctly identify:', {"dataTable":{"rows":[{"cells":[{"value":"Character Type"},{"value":"Expected Count"},{"value":"Sample Dialogue"}]},{"cells":[{"value":"narrator"},{"value":"3"},{"value":"The story begins"}]},{"cells":[{"value":"character"},{"value":"4"},{"value":"Hello"}]}]}}, { page }); 
    await And('each character should have appropriate voice assignments', null, { page }); 
    await And('the dialogue attribution should be accurate', null, { page }); 
  });

  test('Voice customization workflow', async ({ Given, page, When, Then, And }) => { 
    await Given('I have uploaded and analyzed a text file', null, { page }); 
    await When('I view the character analysis results', null, { page }); 
    await Then('I should see voice options for each character', null, { page }); 
    await And('I should be able to preview different voices', null, { page }); 
    await When('I select a different voice for a character', null, { page }); 
    await Then('the voice selection should be saved', null, { page }); 
    await And('subsequent audio generation should use the new voice', null, { page }); 
  });

  test('Error handling during audio generation', async ({ Given, page, When, Then, And }) => { 
    await Given('I upload a very long text file', null, { page }); 
    await When('I attempt to generate an audiobook', null, { page }); 
    await Then('I should see progress indicators', null, { page }); 
    await And('if generation fails, I should see a clear error message', null, { page }); 
    await And('I should be able to retry the generation', null, { page }); 
  });

  test('Mobile-responsive audiobook creation', async ({ Given, page, When, Then, And }) => { 
    await Given('I am viewing the page on a mobile device', null, { page }); 
    await When('I upload a text file using the mobile interface', null, { page }); 
    await Then('the file upload should work correctly', null, { page }); 
    await And('the character analysis should be readable on mobile', null, { page }); 
    await And('all interaction buttons should be touch-friendly', null, { page }); 
    await And('the generated audiobook should be downloadable on mobile', null, { page }); 
  });

  test('Performance validation for reasonable file sizes', async ({ Given, page, When, Then, And }) => { 
    await Given('I upload a text file of approximately 5000 words', null, { page }); 
    await When('I analyze the characters', null, { page }); 
    await Then('the analysis should complete within 10 seconds', null, { page }); 
    await When('I generate the audiobook', null, { page }); 
    await Then('the generation should complete within 60 seconds', null, { page }); 
    await And('the resulting audio file should be of good quality', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use('tests/features/end-to-end-workflow.feature'),
  $bddFileData: ({}, use) => use(bddFileData),
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":11,"pickleLine":10,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given the backend API is running","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the audiobook converter page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":11,"keywordType":"Action","textWithKeyword":"When I upload a text file with dialogue \"Test story. \\\"Hello there!\\\" said Alice. \\\"How are you?\\\" asked Bob.\"","stepMatchArguments":[{"group":{"start":35,"value":"\"Test story. \\\"Hello there!\\\" said Alice. \\\"How are you?\\\" asked Bob.\"","children":[{"start":36,"value":"Test story. \\\"Hello there!\\\" said Alice. \\\"How are you?\\\" asked Bob.","children":[{"start":48,"value":"\\\" asked Bob.","children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"Then I should see the file name displayed","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":13,"keywordType":"Action","textWithKeyword":"When I click \"Analyze Characters\"","stepMatchArguments":[{"group":{"start":8,"value":"\"Analyze Characters\"","children":[{"start":9,"value":"Analyze Characters","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":15,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"Then I should see character analysis results","stepMatchArguments":[]},{"pwStepLine":16,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"And I should see character \"narrator\" with voice information","stepMatchArguments":[{"group":{"start":23,"value":"\"narrator\"","children":[{"start":24,"value":"narrator","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":17,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"And I should see character \"character\" with voice information","stepMatchArguments":[{"group":{"start":23,"value":"\"character\"","children":[{"start":24,"value":"character","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":18,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"And the character analysis should show correct dialogue counts","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":18,"keywordType":"Action","textWithKeyword":"When I click \"Generate Audiobook\"","stepMatchArguments":[{"group":{"start":8,"value":"\"Generate Audiobook\"","children":[{"start":9,"value":"Generate Audiobook","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":20,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"Then I should see \"Generating Audiobook...\" message","stepMatchArguments":[{"group":{"start":13,"value":"\"Generating Audiobook...\"","children":[{"start":14,"value":"Generating Audiobook...","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":21,"gherkinStepLine":20,"keywordType":"Outcome","textWithKeyword":"And I should eventually see \"Audiobook Ready!\" message within 30 seconds","stepMatchArguments":[{"group":{"start":24,"value":"\"Audiobook Ready!\"","children":[{"start":25,"value":"Audiobook Ready!","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"},{"group":{"start":58,"value":"30","children":[]},"parameterTypeName":"int"}]},{"pwStepLine":22,"gherkinStepLine":21,"keywordType":"Outcome","textWithKeyword":"And I should see a download link for the audiobook","stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":22,"keywordType":"Action","textWithKeyword":"When I click the download link","stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":23,"keywordType":"Outcome","textWithKeyword":"Then an audio file should be downloaded","stepMatchArguments":[]}]},
  {"pwTestLine":27,"pickleLine":25,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given the backend API is running","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the audiobook converter page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":28,"gherkinStepLine":26,"keywordType":"Context","textWithKeyword":"Given I upload a complex text file with multiple characters","stepMatchArguments":[]},{"pwStepLine":29,"gherkinStepLine":27,"keywordType":"Action","textWithKeyword":"When I analyze the characters","stepMatchArguments":[]},{"pwStepLine":30,"gherkinStepLine":28,"keywordType":"Outcome","textWithKeyword":"Then the character analysis should correctly identify:","stepMatchArguments":[]},{"pwStepLine":31,"gherkinStepLine":32,"keywordType":"Outcome","textWithKeyword":"And each character should have appropriate voice assignments","stepMatchArguments":[]},{"pwStepLine":32,"gherkinStepLine":33,"keywordType":"Outcome","textWithKeyword":"And the dialogue attribution should be accurate","stepMatchArguments":[]}]},
  {"pwTestLine":35,"pickleLine":35,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given the backend API is running","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the audiobook converter page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":36,"gherkinStepLine":36,"keywordType":"Context","textWithKeyword":"Given I have uploaded and analyzed a text file","stepMatchArguments":[]},{"pwStepLine":37,"gherkinStepLine":37,"keywordType":"Action","textWithKeyword":"When I view the character analysis results","stepMatchArguments":[]},{"pwStepLine":38,"gherkinStepLine":38,"keywordType":"Outcome","textWithKeyword":"Then I should see voice options for each character","stepMatchArguments":[]},{"pwStepLine":39,"gherkinStepLine":39,"keywordType":"Outcome","textWithKeyword":"And I should be able to preview different voices","stepMatchArguments":[]},{"pwStepLine":40,"gherkinStepLine":40,"keywordType":"Action","textWithKeyword":"When I select a different voice for a character","stepMatchArguments":[]},{"pwStepLine":41,"gherkinStepLine":41,"keywordType":"Outcome","textWithKeyword":"Then the voice selection should be saved","stepMatchArguments":[]},{"pwStepLine":42,"gherkinStepLine":42,"keywordType":"Outcome","textWithKeyword":"And subsequent audio generation should use the new voice","stepMatchArguments":[]}]},
  {"pwTestLine":45,"pickleLine":44,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given the backend API is running","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the audiobook converter page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":46,"gherkinStepLine":45,"keywordType":"Context","textWithKeyword":"Given I upload a very long text file","stepMatchArguments":[]},{"pwStepLine":47,"gherkinStepLine":46,"keywordType":"Action","textWithKeyword":"When I attempt to generate an audiobook","stepMatchArguments":[]},{"pwStepLine":48,"gherkinStepLine":47,"keywordType":"Outcome","textWithKeyword":"Then I should see progress indicators","stepMatchArguments":[]},{"pwStepLine":49,"gherkinStepLine":48,"keywordType":"Outcome","textWithKeyword":"And if generation fails, I should see a clear error message","stepMatchArguments":[]},{"pwStepLine":50,"gherkinStepLine":49,"keywordType":"Outcome","textWithKeyword":"And I should be able to retry the generation","stepMatchArguments":[]}]},
  {"pwTestLine":53,"pickleLine":51,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given the backend API is running","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the audiobook converter page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":54,"gherkinStepLine":52,"keywordType":"Context","textWithKeyword":"Given I am viewing the page on a mobile device","stepMatchArguments":[]},{"pwStepLine":55,"gherkinStepLine":53,"keywordType":"Action","textWithKeyword":"When I upload a text file using the mobile interface","stepMatchArguments":[]},{"pwStepLine":56,"gherkinStepLine":54,"keywordType":"Outcome","textWithKeyword":"Then the file upload should work correctly","stepMatchArguments":[]},{"pwStepLine":57,"gherkinStepLine":55,"keywordType":"Outcome","textWithKeyword":"And the character analysis should be readable on mobile","stepMatchArguments":[]},{"pwStepLine":58,"gherkinStepLine":56,"keywordType":"Outcome","textWithKeyword":"And all interaction buttons should be touch-friendly","stepMatchArguments":[]},{"pwStepLine":59,"gherkinStepLine":57,"keywordType":"Outcome","textWithKeyword":"And the generated audiobook should be downloadable on mobile","stepMatchArguments":[]}]},
  {"pwTestLine":62,"pickleLine":59,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given the backend API is running","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the audiobook converter page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":63,"gherkinStepLine":60,"keywordType":"Context","textWithKeyword":"Given I upload a text file of approximately 5000 words","stepMatchArguments":[{"group":{"start":38,"value":"5000","children":[]},"parameterTypeName":"int"}]},{"pwStepLine":64,"gherkinStepLine":61,"keywordType":"Action","textWithKeyword":"When I analyze the characters","stepMatchArguments":[]},{"pwStepLine":65,"gherkinStepLine":62,"keywordType":"Outcome","textWithKeyword":"Then the analysis should complete within 10 seconds","stepMatchArguments":[{"group":{"start":36,"value":"10","children":[]},"parameterTypeName":"int"}]},{"pwStepLine":66,"gherkinStepLine":63,"keywordType":"Action","textWithKeyword":"When I generate the audiobook","stepMatchArguments":[]},{"pwStepLine":67,"gherkinStepLine":64,"keywordType":"Outcome","textWithKeyword":"Then the generation should complete within 60 seconds","stepMatchArguments":[{"group":{"start":38,"value":"60","children":[]},"parameterTypeName":"int"}]},{"pwStepLine":68,"gherkinStepLine":65,"keywordType":"Outcome","textWithKeyword":"And the resulting audio file should be of good quality","stepMatchArguments":[]}]},
]; // bdd-data-end