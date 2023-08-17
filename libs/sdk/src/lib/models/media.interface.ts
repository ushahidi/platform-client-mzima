import { ApiResponse } from './api-response.interface';

export interface MediaResponse extends ApiResponse {
  result: MediaResult;
}

export interface MediaResult {
  allowed_privileges: string[];
  description: string;
  id: number;
  name: string;
  url: string;
  caption?: string;
}
