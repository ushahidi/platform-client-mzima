export interface CountryCodeResponse {
  count: number;
  curr: string;
  limit: number | null;
  next: string;
  offset: number;
  order: string;
  orderby: string;
  prev: string;
  results: CountryCodeResult[];
  total_count: number;
}

export interface CountryCodeResult {
  allowed_privileges: string[];
  country_code: string;
  country_name: string;
  dial_code: string;
  id: number;
  url: string;
}
