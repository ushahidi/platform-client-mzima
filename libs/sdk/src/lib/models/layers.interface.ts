import { ApiResponse } from './api-response.interface';

export interface LayerResponse extends ApiResponse {
  results: LayerResult[];
}

export interface LayerResult {
  id: number;
  media_id: number;
  allowed_privileges: string[];
  type: string;
  name: string;
  data_url: string;
  options: any[];
  active: number;
  visible_by_default: number;
}
