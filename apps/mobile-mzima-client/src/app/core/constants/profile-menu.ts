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
    label: 'app.profile_info',
    description: 'app.profile_info_desc',
    icon: 'user',
    route: '/profile/information',
    isLoggedGuard: true,
  },
  {
    label: 'app.collections',
    description: 'app.add_edit_collection',
    icon: 'collections',
    route: '/profile/collection',
    isLoggedGuard: true,
  },
  {
    label: 'app.my_posts',
    description: 'app.my_posts_desc',
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
    label: 'app.logout',
    icon: 'logout',
    action: ProfileMenuActions.LOGOUT,
    hideDetails: true,
    isLoggedGuard: true,
  },
  {
    label: 'app.login_register',
    icon: 'logout',
    route: '/auth',
    hideDetails: true,
    isLoggedGuard: false,
  },
];

export const profileInformationMenu: ProfileMenuItem[] = [
  {
    label: 'app.language',
    icon: 'language',
    route: '/profile/select-language',
  },
  {
    label: 'app.help_support',
    description: 'app.help_support_desc',
    icon: 'question',
    action: ProfileMenuActions.SUPPORT,
  },
  {
    label: 'app.terms_and_conditions',
    icon: 'info-rounded',
    route: '/terms-and-conditions',
  },
  {
    label: 'app.privacy_policy',
    icon: 'info-shield',
    route: '/privacy-policy',
  },
];
