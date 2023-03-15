import { ApiResponse } from './api-response.interface';

export interface Collection extends ApiResponse {
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
  user_id?: string;
  view: string;
  view_options?: string;
}
