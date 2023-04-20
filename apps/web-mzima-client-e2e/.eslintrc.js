module.exports = {
  "extends": ["plugin:cypress/recommended", "../web-mzima-client/.eslintrc.js"],
  "ignorePatterns": ["!**/*"],
  "overrides": [
    {
      "files": ["*.ts", "*.tsx", "*.js", "*.jsx"],
      "rules": {
        'cypress/no-unnecessary-waiting': 'off',
      }
    }
  ]
}
