import { ApiResponse } from './api-response.interface';
import { CategoryInterface } from './category.interface';

export interface GeoJsonPostsResponse {
  features: GeoJSON.Feature[];
  total: number;
  type: GeoJSON.GeoJsonTypes;
}

export interface GeoJsonFilter {
  has_location?: string;
  limit?: number;
  offset?: number;
  order?: 'desc' | 'asc';
  order_unlocked_on_top?: boolean;
  orderby?: string;
  reactToFilters?: boolean;
  date_after?: Date | string;
  date_before?: Date | string;
  'source[]'?: string[];
  'tags[]'?: string[];
  'status[]'?: string[];
  'form[]'?: string[];
  created_before_by_id?: string;
  q?: string;
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
  source?: string;
  data_source_message_id?: string;
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
  lock?: string | boolean;
  message?: string;
  parent_id?: number;
  post_date: Date;
  published_to: [];
  sets: [];
  slug: string;
  source?: string;
  status: string;
  tags: PostTag[];
  title: string;
  type: string;
  updated?: string;
  url: string;
  user_id?: number;
  values: {};
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
}

interface PostContent {
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
}

interface PostContentField {
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
