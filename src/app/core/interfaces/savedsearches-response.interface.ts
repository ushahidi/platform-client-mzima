import { ApiResponse } from './api-response.interface';

export interface SavedsearchesResponse extends ApiResponse {
  results: Savedsearch[];
}

export interface Savedsearch {
  allowed_privileges?: string[];
  created?: string;
  description?: string;
  featured?: boolean;
  filter?: any;
  id?: number;
  name?: string;
  role?: string[];
  updated?: Date;
  url?: string;
  user_id?: number;
  view?: string;
  view_options?: any;
  checked?: boolean;
}
