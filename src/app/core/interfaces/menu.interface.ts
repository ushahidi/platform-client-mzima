export interface MenuInterface {
  label: string;
  router: string;
  icon: string;
  adminGuard: boolean;
}

export interface UserMenuInterface {
  label: string;
  icon: string;
  visible: boolean;
  separator?: boolean;
  action: Function;
}
