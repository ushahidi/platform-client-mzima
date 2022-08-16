(window as any).ushahidi = (window as any).ushahidi || {};

const BACKEND_URL = 'https://tuxpiper.api.ushahidi.io/';

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
  DEFAULT_LOCALE: 'en_US',
  OAUTH_CLIENT_ID: 'ushahidiui',
  OAUTH_CLIENT_SECRET: '35e7f0bca957836d05ca0492211b0ac707671261',
  CLAIMED_ANONYMOUS_SCOPES: claimedAnonymousScopes,
  CLAIMED_USER_SCOPES: ['*'],
  MAPBOX_API_KEY:
    (window as any).ushahidi.mapboxApiKey ||
    'pk.eyJ1IjoidXNoYWhpZGkiLCJhIjoiY2lxaXUzeHBvMDdndmZ0bmVmOWoyMzN6NiJ9.CX56ZmZJv0aUsxvH5huJBw', // Default OSS mapbox api key
  USH_DISABLE_CHECKS: ushDisableChecks,
  TOS_RELEASE_DATE: new Date((window as any).ushahidi.tosReleaseDate).toJSON()
    ? new Date((window as any).ushahidi.tosReleaseDate)
    : false, // Date in UTC
  EXPORT_POLLING_INTERVAL: (window as any).ushahidi.export_polling_interval || 30000,
};
