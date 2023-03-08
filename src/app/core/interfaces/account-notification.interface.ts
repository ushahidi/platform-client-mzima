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
  url: string;
  set: {
    id: number;
    url: string;
    name?: string;
  };
  user: {
    id: number;
    url: string;
  };
}
