export interface SavedsearchesResponse {
  count: number;
  curr: string;
  limit?: number;
  next?: string;
  offset?: number;
  order: string;
  orderby: string;
  prev?: string;
  results: Savedsearch[];
  total_count: number;
}

export interface Savedsearch {
  allowed_privileges: string[];
  created: string;
  description: string;
  featured: boolean;
  filter: any;
  id: number;
  name: string;
  role: string[];
  updated?: Date;
  url?: string;
  user_id?: number;
  view: string;
  view_options?: any;
}
