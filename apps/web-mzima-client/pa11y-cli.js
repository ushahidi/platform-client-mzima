const readline = require('readline');
const { exec } = require('child_process');
const axios = require('axios');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const pageUrls = {
  map: 'http://localhost:4200/map',
  feed: 'http://localhost:4200/feed',
  activity: 'http://localhost:4200/activity',
  general: 'http://localhost:4200/settings/general'
};

async function validatePageUrl(pageUrl) {
  try {
    const response = await axios.head(pageUrl);
    return response.status === 200;
  } catch (error) {
    console.error(`Error accessing ${pageUrl}: ${error.message}`);
    return false;
  }
}

function parsePA11YOutput(output) {
  const lines = output.split('\n');
  let errors = 0, warnings = 0;
  for (const line of lines) {
    if (line.includes('error')) {
      errors++;
    } else if (line.includes('warning')) {
      warnings++;
    }
  }
  return { errors, warnings };
}

async function runAccessibilityTest(pageUrl) {
  exec(`npm run test:pa11y -- ${pageUrl}`, (error, stdout) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }

    const parsedOutput = parsePA11YOutput(stdout);
    if (parsedOutput.errors > 0 || parsedOutput.warnings > 0) {
      console.error(`Accessibility issues found on ${pageUrl}:`);
      console.error(`Errors: ${parsedOutput.errors}, Warnings: ${parsedOutput.warnings}`);
    } else {
      console.log(`No accessibility issues found on ${pageUrl}.`);
    }
  });
}

rl.on('line', async (input) => {
  const pageUrl = pageUrls[input];
  if (pageUrl) {
    if (await validatePageUrl(pageUrl)) {
      runAccessibilityTest(pageUrl);
    } else {
      console.log(`Unable to access ${pageUrl}. Please check the URL and try again.`);
    }
  } else {
    console.log('Invalid input. Please try again.');
  }
});

console.log('Enter the page you want to test (map, feed, activity, or general):');