import { ApiResponse } from './api-response.interface';

export interface UserResponse extends ApiResponse {
  results: UserResult[];
}

export interface UserResult {
  allowed_privileges: String[];
  contacts: UserContacts[];
  created: string;
  email: string;
  failed_attempts: number;
  gravatar: string;
  id: number;
  language: string;
  last_attempt: string | null;
  last_login: string | null;
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
  data_source: string | null;
  id: string;
  type: string;
  updated: string | null;
  user_id: string;
}
