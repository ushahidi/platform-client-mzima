export interface ContactsResponseInterface {
  count: number;
  curr?: string;
  limit?: number;
  next: string;
  offset: number;
  order: string;
  orderby: string;
  prev: string;
  results: ContactsInterface[];
  total_count: number;
}

export interface ContactsInterface {
  allowed_privileges: string[];
  can_notify: boolean;
  contact: string;
  country_code?: any;
  created: Date;
  data_source?: string;
  id: number;
  type: string;
  updated?: any;
  url: string;
  user: ContactsUserInterface;
}

export interface ContactsUserInterface {
  id: number;
  url: string;
}
