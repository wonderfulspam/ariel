// Generated from: tests/features/audiobook-converter.feature
import { test } from "playwright-bdd";

test.describe('Audiobook Converter Web Interface', () => {

  test.beforeEach('Background', async ({ Given, page, And }) => {
    await Given('the backend API is running', null, { page }); 
    await And('I am on the audiobook converter page', null, { page }); 
  });
  
  test('Upload and analyze a text file', async ({ When, page, Then, And }) => { 
    await When('I upload a text file "simple_test.txt"', null, { page }); 
    await Then('I should see the file name displayed', null, { page }); 
    await When('I click "Analyze Characters"', null, { page }); 
    await Then('I should see character analysis results', null, { page }); 
    await And('I should see "narrator" character with voice information', null, { page }); 
  });

  test('Generate audiobook from analyzed text', async ({ Given, page, When, Then, And }) => { 
    await Given('I have uploaded and analyzed a text file', null, { page }); 
    await When('I click "Generate Audiobook"', null, { page }); 
    await Then('I should see "Generating Audiobook..." message', null, { page }); 
    await And('I should eventually see "Audiobook Ready!" message', null, { page }); 
    await And('I should see a download link for the audiobook', null, { page }); 
  });

  test('Handle upload errors gracefully', async ({ When, page, Then, And }) => { 
    await When('I try to upload an invalid file type', null, { page }); 
    await Then('I should see an error message', null, { page }); 
    await And('the analyze button should not be enabled', null, { page }); 
  });

  test('Responsive design works on mobile', async ({ Given, page, Then, And }) => { 
    await Given('I am viewing the page on a mobile device', null, { page }); 
    await Then('the interface should be responsive', null, { page }); 
    await And('all buttons should be easily clickable', null, { page }); 
    await And('the text should be readable', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use('tests/features/audiobook-converter.feature'),
  $bddFileData: ({}, use) => use(bddFileData),
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":11,"pickleLine":10,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given the backend API is running","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the audiobook converter page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":11,"keywordType":"Action","textWithKeyword":"When I upload a text file \"simple_test.txt\"","stepMatchArguments":[{"group":{"start":21,"value":"\"simple_test.txt\"","children":[{"start":22,"value":"simple_test.txt","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"Then I should see the file name displayed","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":13,"keywordType":"Action","textWithKeyword":"When I click \"Analyze Characters\"","stepMatchArguments":[{"group":{"start":8,"value":"\"Analyze Characters\"","children":[{"start":9,"value":"Analyze Characters","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":15,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"Then I should see character analysis results","stepMatchArguments":[]},{"pwStepLine":16,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"And I should see \"narrator\" character with voice information","stepMatchArguments":[{"group":{"start":13,"value":"\"narrator\"","children":[{"start":14,"value":"narrator","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":19,"pickleLine":17,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given the backend API is running","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the audiobook converter page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":20,"gherkinStepLine":18,"keywordType":"Context","textWithKeyword":"Given I have uploaded and analyzed a text file","stepMatchArguments":[]},{"pwStepLine":21,"gherkinStepLine":19,"keywordType":"Action","textWithKeyword":"When I click \"Generate Audiobook\"","stepMatchArguments":[{"group":{"start":8,"value":"\"Generate Audiobook\"","children":[{"start":9,"value":"Generate Audiobook","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":22,"gherkinStepLine":20,"keywordType":"Outcome","textWithKeyword":"Then I should see \"Generating Audiobook...\" message","stepMatchArguments":[{"group":{"start":13,"value":"\"Generating Audiobook...\"","children":[{"start":14,"value":"Generating Audiobook...","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":23,"gherkinStepLine":21,"keywordType":"Outcome","textWithKeyword":"And I should eventually see \"Audiobook Ready!\" message","stepMatchArguments":[{"group":{"start":24,"value":"\"Audiobook Ready!\"","children":[{"start":25,"value":"Audiobook Ready!","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":24,"gherkinStepLine":22,"keywordType":"Outcome","textWithKeyword":"And I should see a download link for the audiobook","stepMatchArguments":[]}]},
  {"pwTestLine":27,"pickleLine":24,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given the backend API is running","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the audiobook converter page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":28,"gherkinStepLine":25,"keywordType":"Action","textWithKeyword":"When I try to upload an invalid file type","stepMatchArguments":[]},{"pwStepLine":29,"gherkinStepLine":26,"keywordType":"Outcome","textWithKeyword":"Then I should see an error message","stepMatchArguments":[]},{"pwStepLine":30,"gherkinStepLine":27,"keywordType":"Outcome","textWithKeyword":"And the analyze button should not be enabled","stepMatchArguments":[]}]},
  {"pwTestLine":33,"pickleLine":29,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given the backend API is running","isBg":true,"stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And I am on the audiobook converter page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":34,"gherkinStepLine":30,"keywordType":"Context","textWithKeyword":"Given I am viewing the page on a mobile device","stepMatchArguments":[]},{"pwStepLine":35,"gherkinStepLine":31,"keywordType":"Outcome","textWithKeyword":"Then the interface should be responsive","stepMatchArguments":[]},{"pwStepLine":36,"gherkinStepLine":32,"keywordType":"Outcome","textWithKeyword":"And all buttons should be easily clickable","stepMatchArguments":[]},{"pwStepLine":37,"gherkinStepLine":33,"keywordType":"Outcome","textWithKeyword":"And the text should be readable","stepMatchArguments":[]}]},
]; // bdd-data-end