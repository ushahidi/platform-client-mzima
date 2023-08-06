export interface MenuInterface {
  label: string;
  router?: string;
  icon: string;
  adminGuard?: boolean;
  action?: () => void;
  hidden?: boolean;
  ref?: string;
}

export interface UserMenuInterface {
  label: string;
  icon: string;
  visible: boolean;
  separator?: boolean;
  router?: string;
  action?: () => void;
  ref?: string;
  adminGuard?: boolean;
  forDesktop?: boolean;
}
