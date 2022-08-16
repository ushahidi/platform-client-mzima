export interface MenuInterface {
  label: string;
  router: string;
  icon: string;
  visible: boolean;
}

export interface UserMenuInterface {
  label: string;
  icon: string;
  visible: boolean;
  action: Function;
}
