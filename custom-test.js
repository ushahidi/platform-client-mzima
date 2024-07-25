const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const blue = '\x1b[34m';
const green = '\x1b[32m';
const reset = '\x1b[0m';

rl.question(`${blue}Enter the URL to test: ${reset}`, (url) => {
  exec(`pa11y --config pa11y.config.js "${url}"`, (error, stdout) => {
    if (error) {
      console.error(`exec error: ${error}`);
      rl.close();
      return;
    }
    console.log(`${green} ${stdout}🎉`);
    rl.close();
  });
});