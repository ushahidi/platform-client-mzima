const fs = require('fs');
const pa11y = require('pa11y');
const puppeteer = require('puppeteer')

// The name of the file to generate the accessibility report to
const outputFile = 'accessibility-report.txt'

// Open the output file in append mode
const outputStream = fs.createWriteStream(outputFile, { flags: 'a' });

// Function to write data to the output file
const writeToOutput = (data) => outputStream.write(data + '\n', (err) => {
  if (err) {
    console.error('Error writing to output file:', err);
  }
});

// Read the URLs from the file
fs.readFile('urls.txt', 'utf-8', async (err, data) => {
  if (err) {
    console.error('Error reading this file:', err)
    return;
  }

  // Split the data into an array of URLs
  const urls = data.trim().split('\n')

  // Puppeteer login page
  const loggedInPage = await login('http://localhost:4200/map')

  // Run pa11y on each URL
  for (const url of urls) {
    try {
      // Pa11y accessibility check 
      // Most pages are not accessible unless logged in.
      const result = await pa11y(url, { runners: ['htmlcs', 'axe'], loggedInPage })

      // Write output to file
      writeToOutput(`Accessibility test for ${url}`)
      if (result.issues.length !== 1) {
        writeToOutput(`\t${result.issues.length} accessibility issues were found`)
      } else {
        writeToOutput(`\t1 accessibility issue was found`)
      }
      writeToOutput('\tThe result is ' + JSON.stringify(result, null, 2))
      writeToOutput('\n');
    } catch (error) {
      console.error(`Accessibility test failed for ${url}:`, error);
    }
  }

  // Close the browser when done
  await loggedInPage.browser.close()
})

// Function for logging in
async function login(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(url);

  // Wait till the sidenav container has loaded
  await page.waitForNavigation('mat-sidenav-container')
  
  // Skip the onboarding process by clicking the cancel button
  await page.click('button[aria-label="Close"]')
  
  // Timeout for mimicking delay while loading
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Click the login/signup button
  await page.waitForSelector('button#auth')
  await page.click('#auth');

  // Wait for the login modal to appear
  await page.waitForSelector('mat-dialog-container');
  
  // Fill in the login form within the modal while mimicking delay when user enters input
  await new Promise(resolve => setTimeout(resolve, 1000));
  await page.type('input[data-qa="email"]', 'admin@example.com')
  await new Promise(resolve => setTimeout(resolve, 1000));
  await page.type('input[data-qa="password"]', 'admin123');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // login 
  await page.click('#btn-login');

  return {browser, page}
}