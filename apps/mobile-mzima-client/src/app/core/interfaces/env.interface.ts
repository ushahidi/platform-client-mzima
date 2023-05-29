export interface EnvConfigInterface {
  production: boolean;
  backend_url: string;
  api_v3: string;
  api_v5: string;
  mapbox_api_key: string;
  default_locale: string;
  oauth_client_id: string;
  oauth_client_secret: string;
  export_polling_interval: number;
  gtm_key: string;
  sentry_dsn: string;
  sentry_environment?: string;
  sentry_debug_mode: boolean;
}
