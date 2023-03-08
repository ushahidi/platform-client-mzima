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
