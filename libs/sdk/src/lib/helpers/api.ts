const deploymentsDomain = 'ushahidi.io';
const apiDomain = 'api.ushahidi.io';

export const defaultApiURl =
  location.protocol +
  '//' +
  location.hostname.replace(deploymentsDomain, apiDomain) +
  (location.port ? ':' + location.port : '');
