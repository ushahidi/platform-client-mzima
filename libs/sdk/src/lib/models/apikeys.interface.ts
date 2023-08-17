import { ApiResponse } from './api-response.interface';

export interface ApiKeysInterface extends ApiResponse {
  results: ApiKeysResultInterface[];
}

export interface ApiKeysResultInterface {
  allowed_privileges: string[];
  created: string;
  updated: string;
  api_key: string;
  id: number;
}
