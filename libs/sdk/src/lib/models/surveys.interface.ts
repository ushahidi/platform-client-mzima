import { FormAttributeInterface } from './forms.interface';

export interface SurveyApiResponse {
  results: SurveyItem[];
  meta: Meta;
}

export interface Meta {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface SurveyItem {
  can_create: any[];
  color: string;
  description: string;
  disabled: boolean;
  enabled_languages: SurveyItemEnabledLanguages;
  everyone_can_create: boolean;
  hide_author: boolean;
  hide_location: boolean;
  hide_time: boolean;
  id: number;
  name: string;
  require_approval: boolean;
  targeted_survey: boolean;
  tasks: SurveyItemTask[];
  translations: any[];
  type: string;
  total?: number;
  visible?: boolean;
  checked?: boolean;
}

export interface SurveyItemEnabledLanguages {
  available: any[];
  default: string;
}

export interface SurveyItemTask {
  description: string;
  fields: FormAttributeInterface[];
  form_id: number;
  id: number;
  label: string;
  priority: number;
  required: boolean;
  show_when_published: boolean;
  task_is_internal_only: boolean;
  translations: any[];
  type: string;
}
