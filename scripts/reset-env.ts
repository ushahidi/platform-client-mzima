const { writeFile } = require('fs');
const { argv } = require('yargs');

// read environment variables from .env file
require('dotenv').config();
// read the command line arguments passed with yargs

const environment = argv.environment;
const isProduction = environment === 'prod';
const targetPath = isProduction
  ? `./src/environments/environment.prod.ts`
  : `./src/environments/environment.ts`;

// we have access to our environment variables
// in the process.env object thanks to dotenv

const environmentFileContent = `
export const environment = {
    production: ${isProduction},
    backend_url: '${process.env['BACKEND_URL']}',
    api_v3: 'api/v3/',
    api_v5: 'api/v5/',
    mapbox_api_key:
      'pk.eyJ1IjoidXNoYWhpZGkiLCJhIjoiY2lxaXUzeHBvMDdndmZ0bmVmOWoyMzN6NiJ9.CX56ZmZJv0aUsxvH5huJBw', // Default OSS mapbox api key
    default_locale: 'en_US',
    oauth_client_id: 'ushahidiui',
    oauth_client_secret: '35e7f0bca957836d05ca0492211b0ac707671261',
  };
`;

// write the content to the respective file
writeFile(targetPath, environmentFileContent, function (err: any) {
  if (err) {
    console.log(err);
  }
  console.log(`Wrote variables to ${targetPath}`);
});
