export interface UserInterfaceResponse {
  data: UserInterface;
}

export interface UserInterface {
  userId?: string | number;
  realname?: string;
  email?: string;
  role?: string;
  permissions?: string[];
  gravatar?: string;
  language?: string;
  allowed_privileges?: string[];
  contacts?: any[];
  created?: Date;
  failed_attempts?: number;
  id?: number;
  last_attempt?: any;
  last_login?: any;
  logins?: number;
  updated?: Date;
  url?: string;
}

export interface UserDataInterface {
  realname?: string;
  email?: string;
  password?: string;
}
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

export interface UserContacts {
  can_notify: string;
  contact: string;
  created: string;
  data_source?: string;
  id: string;
  type: string;
  updated?: string;
  user_id: string;
}
