export enum ProfileMenuActions {
  LOGOUT = 'LOGOUT',
  SUPPORT = 'SUPPORT',
  // RESET_DATA = 'RESET_DATA',
  // CLEAR_PENDING_POSTS = 'CLEAR_PENDING_POSTS',
}

export interface ProfileMenuItem {
  label: string;
  description?: string;
  icon: string;
  route?: string;
  action?: ProfileMenuActions;
  hideDetails?: boolean;
  isLoggedGuard?: boolean;
  disabled?: boolean;
}

export const profileMenu: ProfileMenuItem[] = [
  {
    label: 'Profile information',
    description: 'Edit your photo or information',
    icon: 'user',
    route: '/profile/information',
    isLoggedGuard: true,
  },
  {
    label: 'Collections',
    description: 'Add or Edit collections',
    icon: 'collections',
    route: '/profile/collection',
    isLoggedGuard: true,
  },
  {
    label: 'My posts',
    description: 'Post you’ve created',
    icon: 'posts',
    route: '/profile/posts',
    isLoggedGuard: true,
  },
  // {
  //   label: 'Clear pending posts',
  //   icon: 'cloud',
  //   action: ProfileMenuActions.CLEAR_PENDING_POSTS,
  //   hideDetails: true,
  // },
  // {
  //   label: 'Reset App data',
  //   icon: 'reset',
  //   action: ProfileMenuActions.RESET_DATA,
  //   hideDetails: true,
  // },
  {
    label: 'Log out',
    icon: 'logout',
    action: ProfileMenuActions.LOGOUT,
    hideDetails: true,
    isLoggedGuard: true,
  },
  {
    label: 'Log in or Sign up',
    icon: 'logout',
    route: '/auth',
    hideDetails: true,
    isLoggedGuard: false,
  },
];

export const profileInformationMenu: ProfileMenuItem[] = [
  {
    label: 'Language',
    icon: 'language',
    route: '/profile/select-language',
  },
  {
    label: 'Help and Support',
    description: 'Documentation, Report a bug',
    icon: 'question',
    action: ProfileMenuActions.SUPPORT,
  },
  {
    label: 'Terms and Conditions',
    icon: 'info-rounded',
    route: '/terms-and-conditions',
  },
  {
    label: 'Privacy Policy',
    icon: 'info-shield',
    route: '/privacy-policy',
  },
];
