import { ApiNResponse, ApiResponse } from './api-response.interface';

export interface UserResponse extends ApiResponse, ApiNResponse {
  results: UserResult[];
  data: UserResult[];
}

export interface UserResult {
  allowed_privileges: string[];
  contacts: UserContacts[];
  created: string;
  email: string;
  failed_attempts: number;
  gravatar: string;
  id: number;
  language: string;
  last_attempt?: string;
  last_login?: string;
  logins: number;
  realname: string;
  role: string;
  updated: string;
  url: string;
}

interface UserContacts {
  can_notify: string;
  contact: string;
  created: string;
  data_source?: string;
  id: string;
  type: string;
  updated?: string;
  user_id: string;
}
