export interface MenuInterface {
  label: string;
  router?: string;
  icon: string;
  adminGuard?: boolean;
  action?: Function;
  hidden?: boolean;
  ref?: string;
}

export interface UserMenuInterface {
  label: string;
  icon: string;
  visible: boolean;
  separator?: boolean;
  router?: string;
  action?: Function;
  ref?: string;
}
