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

export interface DonationConfigInterface {
  description: string;
  title: string;
  wallet: string;
  images: Array<{ original_file_url: string; id: number }>;
  enabled: boolean;
}

export interface SiteConfigInterface {
  allowed_privileges?: string[];
  client_url?: boolean;
  date_format?: string;
  description?: string;
  disable_registration?: boolean;
  email?: string;
  first_login?: boolean;
  id?: string;
  image_header?: string;
  language?: string;
  name?: string;
  tier?: string;
  timezone?: string;
  url?: string;
  private?: boolean;
  donation?: DonationConfigInterface;
}

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
