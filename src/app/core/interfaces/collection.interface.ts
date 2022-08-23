import { ApiResponse } from './api-response.interface';

export interface Collection extends ApiResponse {
  results: CollectionResult[];
}

export interface CollectionResult {
  allowed_privileges: String[];
  created: string;
  description: string;
  featured: boolean;
  id: number;
  name: string;
  role: string | null;
  updated: string | null;
  url: string | null;
  user_id: string | null;
  view: string;
  view_options: string | null;
}
