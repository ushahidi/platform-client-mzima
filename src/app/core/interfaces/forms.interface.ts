import { ApiResponse } from './api-response.interface';

export interface FormsResponse extends ApiResponse {
  results: FormInterface[];
}

export interface FormInterface {
  allowed_privileges: string[];
  can_create: string[];
  created: Date;
  description: string;
  disabled: boolean;
  parent_id?: string;
  id: number;
  name: string;
  tags: TagInterface[];
  permissions: string[];
  targeted_survey: boolean;
  url: string;
  type: string;
  tasks?: FormTaskInterface[];
  attributes?: FormAttributeInterface[];
}

export interface FormTaskInterface {
  allowed_privileges: string[];
  description: string;
  form_id: number;
  icon: string;
  id: number;
  label: string;
  required: boolean;
  show_when_published: boolean;
  task_is_internal_only: boolean;
  type: string;
}

export interface FormAttributeInterface {
  cardinality: number;
  config: any[];
  default: string;
  form_stage_id: number;
  id: number;
  input: string;
  instructions: string;
  key: string;
  label: string;
  options: any[];
  priority: number;
  required: boolean;
  response_private: boolean;
  translations: any[];
  type: string;
}

export interface FormCSVInterface {
  allowed_privileges: string[];
  collection_id: string;
  columns: string[];
  completed: boolean;
  created: Date;
  filename: string;
  id: number;
  maps_to: any;
  mime: string;
  processed: boolean;
  size: number;
  status: string;
}

export interface TagInterface {
  id: number;
  url: string;
}
