export interface SessionTokenInterface {
  accessToken: string;
  accessTokenExpires: number;
  grantType: string;
}

export interface UserInterface {
  userId?: string;
  realname?: string;
  email?: string;
  role?: string;
  permissions?: string;
  gravatar?: string;
  language?: string;
}

export interface SiteConfigInterface {}

export interface FeaturesConfigInterface {}

export interface SessionConfigInterface {
  site: SiteConfigInterface;
  features: FeaturesConfigInterface;
}
