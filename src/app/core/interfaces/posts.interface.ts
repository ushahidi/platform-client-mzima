export interface GeoJsonPostsResponse {
  features: GeoJSON.Feature[];
  total: number;
  type: GeoJSON.GeoJsonTypes;
}

export interface GeoJsonFilter {
  has_location: string;
  limit: number;
  offset: number;
  order: 'desc' | 'asc';
  order_unlocked_on_top: boolean;
  orderby: string;
  reactToFilters: boolean;
}

export interface PostPropertiesInterface {
  id: number;
  content: string;
  title: string;
  post_date: Date;
  created: Date;
  color: string;
  type: string;
  slug: string;
  user?: PostPropertiesUser;
  author_realname?: string;
  status?: string;
  contact?: any;
}

export interface PostPropertiesUser {
  id: number;
  url: string;
  gravatar?: string;
  realname?: string;
}
