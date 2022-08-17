import { environment } from '@environments';

(window as any).ushahidi = (window as any).ushahidi || {};

const BACKEND_URL = environment.backend_url;

const backendUrl = ((window as any).ushahidi.backendUrl = (
    (window as any).ushahidi.backendUrl || BACKEND_URL
  ).replace(/\/$/, '')),
  intercomAppId = ((window as any).ushahidi.intercomAppId =
    (window as any).ushahidi.intercomAppId || ''),
  ushDisableChecks = (window as any).ushahidi.ushDisableChecks,
  verifier = ((window as any).ushahidi.verifier = (window as any).ushahidi.verifier),
  appStoreId = ((window as any).ushahidi.appStoreId = (window as any).ushahidi.appStoreId || ''),
  apiUrl = ((window as any).ushahidi.apiUrl = backendUrl + '/api/v3'),
  claimedAnonymousScopes = [
    'posts',
    'country_codes',
    'media',
    'forms',
    'api',
    'tags',
    'savedsearches',
    'sets',
    'users',
    'stats',
    'layers',
    'config',
    'messages',
    'notifications',
    'webhooks',
    'contacts',
    'roles',
    'permissions',
    'csv',
  ];

export const CONST = {
  BACKEND_URL: BACKEND_URL,
  API_URL: apiUrl,
  INTERCOM_APP_ID: intercomAppId,
  APP_STORE_ID: appStoreId,
  VERIFIER: verifier,
  DEFAULT_LOCALE: environment.default_locale,
  OAUTH_CLIENT_ID: environment.oauth_client_id,
  OAUTH_CLIENT_SECRET: environment.oauth_client_secret,
  CLAIMED_ANONYMOUS_SCOPES: claimedAnonymousScopes,
  CLAIMED_USER_SCOPES: ['*'],
  MAPBOX_API_KEY: (window as any).ushahidi.mapboxApiKey || environment.mapbox_api_key,
  USH_DISABLE_CHECKS: ushDisableChecks,
  TOS_RELEASE_DATE: new Date((window as any).ushahidi.tosReleaseDate).toJSON()
    ? new Date((window as any).ushahidi.tosReleaseDate)
    : false, // Date in UTC
  EXPORT_POLLING_INTERVAL: (window as any).ushahidi.export_polling_interval || 30000,
};
