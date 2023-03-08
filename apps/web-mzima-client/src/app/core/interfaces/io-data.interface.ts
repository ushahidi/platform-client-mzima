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

export interface ExportJobInterface {
  allowed_privileges: string[];
  created: Date | string;
  entity_type: string;
  fields: string[];
  filters: any;
  header_row: any[];
  hxl_heading_row: string[];
  hxl_meta_data_id: number;
  id: number;
  include_hxl: boolean;
  send_to_browser: boolean;
  send_to_hdx: boolean;
  status: string;
  total_batches: number;
  total_rows: number;
  updated?: Date;
  url: string;
  url_expiration: number | string | Date;
  created_timestamp: number | string | Date;
}

export interface ExportJobsResponse extends ApiResponse {
  results: ExportJobInterface[];
}
