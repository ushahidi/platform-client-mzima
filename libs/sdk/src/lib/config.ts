import { InjectionToken } from '@angular/core';

export interface SdkConfig {
  url: string;
}

// Cloud API routing
// Assuming we have a hostname like zombies.ushahidi.io
// The API will be zombies.api.ushahidi.io
const deploymentsDomain = 'ushahidi.io';
const apiDomain = 'api.ushahidi.io';

const defaultApiURl =
  location.protocol +
  '//' +
  location.hostname.replace(deploymentsDomain, apiDomain) +
  (location.port ? ':' + location.port : '');

export const API_CONFIG_TOKEN = new InjectionToken<SdkConfig>('config', {
  providedIn: 'root',
  factory: () => ({ url: defaultApiURl }),
});
