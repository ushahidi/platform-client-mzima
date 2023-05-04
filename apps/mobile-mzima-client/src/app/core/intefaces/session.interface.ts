export interface SessionTokenInterface {
  accessToken: string;
  accessTokenExpires: number;
  grantType: string;
  tokenType: string;
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

export interface FeatureFlag {
  enabled: boolean;
}

export interface FeaturesConfigInterface {
  allowed_privileges?: string[];
  'anonymise-reporters'?: FeatureFlag;
  'csv-speedup'?: FeatureFlag;
  'data-import'?: FeatureFlag;
  disable_registration?: FeatureFlag;
  donation?: FeatureFlag;
  'gmail-support'?: FeatureFlag;
  hxl?: FeatureFlag;
  id?: string;
  limits?: any;
  private?: FeatureFlag;
  roles?: FeatureFlag;
  'targeted-surveys'?: FeatureFlag;
  url?: string;
  webhooks?: FeatureFlag;
  'user-settings'?: FeatureFlag;
  'data-providers'?: any;
  views?: any;
}

export interface MapViewInterface {
  baselayer: 'streets' | 'satellite' | 'hOSM' | 'MapQuestAerial' | 'MapQuest';
  color: string;
  fit_map_boundaries: boolean;
  icon: string;
  lat: number;
  lon: number;
  zoom: number;
}

export interface MapConfigInterface {
  allowed_privileges?: string[];
  cluster_radius?: number;
  clustering?: boolean;
  default_view?: MapViewInterface;
  location_precision?: number;
}

export interface SessionConfigInterface {
  site: SiteConfigInterface;
  features: FeaturesConfigInterface;
  map: MapConfigInterface;
}
