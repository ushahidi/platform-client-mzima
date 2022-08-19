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
