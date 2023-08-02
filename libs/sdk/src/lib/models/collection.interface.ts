import { ApiNResponse } from './api-response.interface';

export interface Collection extends ApiNResponse {
  results: CollectionResult[];
}

export interface CollectionResult {
  allowed_privileges: string[];
  created: string;
  description: string;
  featured: boolean;
  id: number;
  name: string;
  role?: string[];
  updated?: string;
  url?: string;
  user_id?: string | number;
  view: string;
  view_options?: string;
  posts_count?: number;
  my_collection?: boolean;
  visible?: boolean;
}

export interface CollectionItem extends CollectionResult {
  checked?: boolean;
}
