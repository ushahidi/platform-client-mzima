import { ApiResponse } from './api-response.interface';

export interface DataSourceConfigInterface {
  id: string;
  url: string;
  providers: Providers;
  'authenticable-providers': AuthenticableProviders;
  email: Email;
  twilio: Twilio;
  smssync: Smssync;
  twitter: Twitter;
  nexmo: Nexmo;
  frontlinesms: Frontlinesms;
  gmail: Gmail;
  allowed_privileges: string[];
}

export interface Providers {
  smssync: boolean;
  email: boolean;
  outgoingemail: boolean;
  twilio: boolean;
  nexmo: boolean;
  twitter: boolean;
  frontlinesms: boolean;
  gmail: boolean;
}

export interface AuthenticableProviders {
  gmail: boolean;
}

export interface Email {
  incoming_type: string;
  incoming_server: string;
  incoming_port: string;
  incoming_security: string;
  incoming_username: string;
  incoming_password: string;
}

export interface Twilio {}

export interface Smssync {}

export interface Twitter {}

export interface Nexmo {}

export interface Frontlinesms {
  server_url: string;
  key: string;
  secret: string;
}

export interface Gmail {
  redirect_uri: string;
  authenticated: boolean;
}

export interface DataSource extends ApiResponse {
  results: DataSourceResult[];
}

export interface DataSourceResult {
  allowed_privileges: [];
  available_provider: boolean;
  id: string;
  inbound_fields: DataSourceInboud[];
  name: string;
  options: DataSourceOptions;
  services: string[];
  url: string;
  visible_survey: boolean;
  control_options: any[];
}

export interface DataSourceInboud {
  Subject?: string;
  Date?: string;
  Message?: string;
  form_label?: string;
  type?: string;
}

export interface DataSourceOptions {
  api_key?: OptionsField;
  app_id?: OptionsField;
  short_code?: OptionsField;
  username?: OptionsField;
  client_id?: OptionsField;
  client_secret?: OptionsField;
  intro_text?: OptionsField;
  redirect_uri?: OptionsField;
  consumer_key?: OptionsField;
  consumer_secret?: OptionsField;
  intro_step1?: OptionsField;
  intro_step2?: OptionsField;
  oauth_access_token?: OptionsField;
  oauth_access_token_secret?: OptionsField;
  twitter_search_terms?: OptionsField;
  account_sid?: OptionsField;
  auth_token?: OptionsField;
  from?: OptionsField;
  sms_auto_response?: OptionsField;
  secret?: OptionsField;
  api_secret?: OptionsField;
  key?: OptionsField;
  server_url?: OptionsField;
  incoming_password?: OptionsField;
  incoming_port?: OptionsField;
  incoming_security?: OptionsField;
  incoming_server?: OptionsField;
  incoming_type?: OptionsField;
  incoming_username?: OptionsField;
}

interface OptionsField {
  description?: string;
  input?: string;
  label?: string;
  rules?: string[];
  is_gmail_support?: boolean;
  control_rules?: RulesField[];
  control_label?: string;
  control_value?: string;
}

interface RulesField {
  required?: boolean;
  number?: boolean;
}
