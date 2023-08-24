import { ApiResponse } from './api-response.interface';

export interface HXLMetadataInterface {
  user_id: string;
  private: boolean;
  dataset_title: string;
  license_id: string;
  organisation_id: string;
  organisation_name: string;
  source: string;
}

export interface HXLLicenseInterface {
  id: string;
  name: string;
  link: string;
  code: string;
  allowed_privileges: string[];
}

export interface HXLMetadataResponse extends ApiResponse {
  results: HXLMetadataInterface[];
}
