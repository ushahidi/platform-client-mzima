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
