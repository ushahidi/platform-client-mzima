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

export interface MapViewInterface {
  baselayer: 'streets' | 'satellite' | 'hOSM';
  color: string;
  fit_map_boundaries: boolean;
  icon: string;
  lat: number;
  lon: number;
  zoom: number;
}

export interface MapConfigInterface {
  allowed_privileges: string[];
  cluster_radius: number;
  clustering: boolean;
  default_view: MapViewInterface;
  location_precision: number;
}

export interface SessionConfigInterface {
  site: SiteConfigInterface;
  features: FeaturesConfigInterface;
}
