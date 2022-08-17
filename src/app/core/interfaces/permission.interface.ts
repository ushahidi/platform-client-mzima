export interface PermissionResponse {
  count: number;
  curr: string;
  limit: number | null;
  next: string;
  offset: number;
  order: string;
  orderby: string;
  prev: string;
  results: PermissionResult[];
  total_count: number;
}

export interface PermissionResult {
  allowed_privileges: string[];
  0: string;
  1: string;
  description: string;
  id: number;
  name: string;
  url: string;
}
