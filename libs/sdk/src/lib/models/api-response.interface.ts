export interface ApiResponse {
  count: number;
  curr: string;
  limit?: number;
  next: string;
  offset: number;
  order: string;
  orderby: string;
  prev: string;
  total_count: number;
}

export interface ApiNResponse {
  count: number;
  links: {
    first?: string;
    last?: string;
    next?: string;
    prev?: string;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}
