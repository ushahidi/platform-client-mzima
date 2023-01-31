export interface MenuInterface {
  label: string;
  router?: string;
  icon: string;
  adminGuard?: boolean;
  action?: Function;
  hidden?: boolean;
}

export interface UserMenuInterface {
  label: string;
  icon: string;
  visible: boolean;
  separator?: boolean;
  router?: string;
  action?: Function;
}
