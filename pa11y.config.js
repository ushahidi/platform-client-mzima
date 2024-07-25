module.exports = {
  timeout: 10000,
  headers: {
    "User-Agent": "Pa11y"
  },
  includeNotices: true,
  includeWarnings: true,
  log: {
    debug: console.log,
    error: console.error,
    info: console.log
  },
  standard: 'WCAG2AA', 
  reporter: 'cli', 
  ignore: [],
  threshold: {
    errors: 0, 
    warnings: 0 
  }
};