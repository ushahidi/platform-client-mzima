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
    label: 'profile.menu.profile_information',
    description: 'profile.menu.profile_information_description',
    icon: 'user',
    route: '/profile/information',
    isLoggedGuard: true,
  },
  // {
  //   label: 'Collections',
  //   description: 'Add or Edit collections',
  //   icon: 'collections',
  //   route: '/profile/collection',
  //   isLoggedGuard: true,
  // },
  {
    label: 'profile.menu.my_posts',
    description: 'profile.menu.my_posts_description',
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
    label: 'profile.menu.log_out',
    icon: 'logout',
    action: ProfileMenuActions.LOGOUT,
    hideDetails: true,
    isLoggedGuard: true,
  },
  {
    label: 'profile.menu.log_in_or_sign_up',
    icon: 'logout',
    route: '/auth',
    hideDetails: true,
    isLoggedGuard: false,
  },
];

export const profileInformationMenu: ProfileMenuItem[] = [
  // {
  //   label: 'Help and Support',
  //   description: 'Documentation, Report a bug',
  //   icon: 'question',
  //   action: ProfileMenuActions.SUPPORT,
  // },
  {
    label: 'profile.menu.terms_and_conditions',
    icon: 'info-rounded',
    route: '/terms-and-conditions',
  },
  {
    label: 'profile.menu.privacy_policy',
    icon: 'info-shield',
    route: '/privacy-policy',
  },
];
