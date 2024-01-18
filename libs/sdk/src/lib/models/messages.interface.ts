import { ApiResponse } from './api-response.interface';

export interface MessageResponse extends ApiResponse {
  results: MessageResult[];
}

export interface MessageResult {
  id: number;
  parent_id: number;
  contact_id: number;
  post_id: number;
  user_id: number;
  data_source: any;
  data_source_message_id: number;

  title: string;
  message: string;
  type: string;
  status: string;
  direction: string;
  created: Date;
  additional_data: any;
  notification_post_id: number;
  contact: MessageContact;
}

export interface MessageContact {
  id: number;
  user_id: number;
  data_source: number;
  type: string;
  contact: string;
  created: Date;
  can_notify: number;
}

export interface MessageFilter {
  page: number;
  limit: number;
  order?: 'desc' | 'asc';
  orderby: string;
  contact?: number;
}
