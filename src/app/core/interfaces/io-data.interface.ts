import { ApiResponse } from './api-response.interface';

export interface ImportCSVFileInterface {
  allowed_privileges: string[];
  collection_id: string;
  columns: string[];
  completed: Date;
  created: Date;
  errors: any;
  filename: string;
  fixed: any;
  id: number;
  maps_to: any[];
  mime: string;
  processed: string;
  size: number;
  status: string;
  updated: Date;
  url: string;
}

export interface ImportCSVFilesResponse extends ApiResponse {
  results: ImportCSVFileInterface[];
}
