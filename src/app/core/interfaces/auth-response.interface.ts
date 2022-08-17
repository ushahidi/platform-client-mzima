export interface AuthResponse {
  access_token: string;
  expires_in?: number;
  expires?: number;
  refresh_token: string;
  token_type: string;
}
