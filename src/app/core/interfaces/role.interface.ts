export interface RoleResponse {
  count: number;
  curr: string;
  limit: number | null;
  next: string;
  offset: number;
  order: string;
  orderby: string;
  prev: string;
  results: RoleResult[];
  total_count: number;
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
