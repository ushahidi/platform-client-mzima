import { ApiResponse } from './api-response.interface';

export interface WebhookApi extends ApiResponse {
  results: WebhookResult[];
}

export interface WebhookResult {
  allowed_privileges: string[];
  created: string;
  destination_field_key?: string;
  entity_type: string;
  event_type: string;
  form_id?: string | number;
  id: number;
  name: string;
  shared_secret: string;
  source_field_key?: string;
  updated: string;
  url: string;
  user: {
    id: number;
    url: string;
  };
  webhook_uuid: string;
}
