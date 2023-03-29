import { ApiResponse } from './api-response.interface';

export interface RolesResponse extends ApiResponse {
  results: RoleResult[];
}

export interface RoleResponse extends ApiResponse {
  result: RoleResult;
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
