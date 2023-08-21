import { ApiResponse } from './api-response.interface';

export interface MediaResponse extends ApiResponse {
  result: MediaResult;
}

export interface MediaResult {
  id: 1012;
  user_id: number | null;
  caption?: string;
  mime?: string;
  original_file_url: string;
  original_file_size: number;
  original_width: number;
  original_height: number;
  created: Date;
  updated?: Date | null;
  allowed_privileges: string[];
}
