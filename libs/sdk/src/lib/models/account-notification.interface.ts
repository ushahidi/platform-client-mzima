export enum NotificationTypeEnum {
  Collection = 'collection',
  SavedSearch = 'savedSearch',
}

export interface AccountNotificationsInterface {
  id: number;
  type: NotificationTypeEnum;
  created: Date;
  allowed_privileges: string[];
  updated: Date | null;
  set_id: number;
  set_name?: string;
  user_id: number;
}
