export interface CategoryInterface {
  children: CategoryInterface[];
  color: string;
  description: string;
  enabled_languages: {
    available: any[];
    default: string;
  };
  icon: string;
  id: number;
  parent: CategoryInterface;
  parent_id: number;
  priority: number;
  role?: string[];
  slug: string;
  tag: string;
  translations: any;
  type: string;
}
