import { ApiResponse } from './api-response.interface';

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
export interface PostApiResponse extends ApiResponse {
  results: PostResult[];
}

export interface PostResult {
  allowed_privileges: String[];
  author_email: string | null;
  author_realname: string | null;
  color: string;
  completed_stages: [];
  contact: string | null;
  content: string;
  created: string;
  data_source_message_id: number | null;
  form: PostForm;
  id: number;
  locale: string;
  lock: string | boolean | null;
  message: string | null;
  parent_id: number | null;
  post_date: string;
  published_to: [];
  sets: [];
  slug: string;
  source: string | null;
  status: string;
  tags: PostTag[];
  title: string;
  type: string;
  updated: string | null;
  url: string;
  user_id: number | null;
  values: {};
}

interface PostTag {
  id: number;
  url: string;
}

interface PostForm {
  id: number;
  url: string;
}
