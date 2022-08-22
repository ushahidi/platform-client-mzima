import { ApiResponse } from './api-response.interface';

export interface CountryCodeResponse extends ApiResponse {
  results: CountryCodeResult[];
}

export interface CountryCodeResult {
  allowed_privileges: string[];
  country_code: string;
  country_name: string;
  dial_code: string;
  id: number;
  url: string;
}
