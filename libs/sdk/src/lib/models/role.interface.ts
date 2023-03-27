import { ApiResponse } from './api-response.interface';

export interface RoleResponse extends ApiResponse {
  results: RoleResult[];
}

export interface RoleResult {
  allowed_privileges: string[];
  description: string;
  display_name: string;
  id: number;
  name: string;
  permissions: string[];
  protected: boolean;
  url: string;
}
