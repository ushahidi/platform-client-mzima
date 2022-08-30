import { ApiResponse } from './api-response.interface';

export interface ApiKeysResponse extends ApiResponse {
  results: ApiKeyResult[];
}

export interface ApiKeyResult {
  id: string;
  allowed_privileges: string[];
  api_key: string;
  created: Date;
  url: string;
  updated?: Date;
}
