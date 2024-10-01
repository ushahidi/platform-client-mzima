import { ApiNResponse } from './api-response.interface';
import { CategoryInterface } from './category.interface';
import * as GeoJSON from 'geojson';

export interface GeoJsonPostsResponse extends ApiNResponse {
  count: number;
  results: GeoJsonItem[];
}

export interface GeoJsonItem {
  data_source_message_id: string;
  description: string;
  geojson: {
    features: GeoJSON.Feature[];
    type: GeoJSON.GeoJsonTypes;
  };
  id: number;
  'marker-color': string;
  source: string;
  title: string;
}

export interface GeoJsonFilter {
  has_location?: string;
  currentView?: 'map' | 'feed' | 'myposts';
  limit?: number;
  offset?: number;
  order?: 'desc' | 'asc';
  order_unlocked_on_top?: boolean;
  include_unstructured_posts?: boolean;
  orderby?: string;
  set?: string;
  reactToFilters?: boolean;
  date_after?: Date | string;
  date_before?: Date | string;
  'source[]'?: string[];
  'tags[]'?: string[];
  'status[]'?: string[];
  'form[]'?: string[];
  created_before_by_id?: string;
  center_point?: string;
  within_km?: string;
  q?: string;
  page?: number;
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
  status?: PostStatus;
  contact?: any;
  source?: string;
  locks?: any[];
  data_source_message_id?: string;
  allowed_privileges: string[];
}

export interface PostPropertiesUser {
  id: number;
  url: string;
  gravatar?: string;
  realname?: string;
}
export interface PostApiResponse extends ApiNResponse {
  results: PostResult[];
}

export enum PostStatus {
  Published = 'published',
  Draft = 'draft',
  Archived = 'archived',
}

export interface PostResult {
  allowed_privileges: string[];
  author_email?: string;
  author_realname?: string;
  color: string;
  completed_stages: [];
  contact?: string | any;
  content: string;
  created: Date;
  data_source_message_id?: string;
  form: PostForm;
  id: number;
  locale: string;
  locks?: any[];
  message?: string;
  parent_id?: number;
  post_date: Date;
  published_to: [];
  sets: number[];
  slug: string;
  source?: string;
  status: PostStatus;
  tags: PostTag[];
  title: string;
  type: string;
  updated?: string;
  url: string;
  user_id?: number;
  values: object;
  categories?: CategoryInterface[];
  form_id?: number;
  user?: PostPropertiesUser;
  post_content?: PostContent[];
}

interface PostTag {
  id: number;
  url: string;
}

interface PostForm {
  id: number;
  url: string;
  description?: string;
  name?: string;
}

export interface PostContent {
  description?: string;
  fields: PostContentField[];
  form_id: number;
  id: number;
  label: string;
  priority: number;
  required: number;
  show_when_published: boolean;
  task_is_internal_only: boolean;
  translations: any[];
  type: string;
  completed?: boolean;
}

interface PostStatsItem {
  id: number;
  label: string;
  source: string;
  total: number;
}

interface PostStatistics {
  group_by_meta: { group_by: string };
  group_by_total_posts: PostStatsItem[];
  total_posts: number;
  unmapped: number;
}
export interface PostStatsResponse {
  result: PostStatistics;
}

export interface PostContentField {
  cardinality: number;
  config: any[];
  default: string;
  description?: string;
  form_stage_id: number;
  id: number;
  input: string;
  instructions: string;
  key: string;
  label: string;
  options: any;
  priority: number;
  required: number;
  response_private: number;
  translations: any[];
  type: string;
  value?: any;
}
