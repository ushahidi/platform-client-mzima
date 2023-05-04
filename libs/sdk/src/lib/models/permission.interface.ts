import { ApiResponse } from './api-response.interface';

export interface PermissionResponse extends ApiResponse {
  results: PermissionResult[];
}

export interface PermissionResult {
  allowed_privileges: string[];
  description: string;
  id: number;
  name: string;
  url: string;
  caption?: string;
}
