export interface ProfileResponseInterface {
  allowed_privileges: string[];
  contacts: any[];
  created: Date;
  email: string;
  failed_attempts: number;
  gravatar: string;
  id: number;
  language?: string;
  last_attempt?: any;
  last_login?: any;
  logins: number;
  realname: string;
  role: string;
  updated: Date;
  url: string;
}

export interface ProfileDataInterface {
  realname?: string;
  email?: string;
  password?: string;
}
