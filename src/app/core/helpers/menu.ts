import { MenuInterface } from '@models';

export const menu: MenuInterface[] = [
  {
    label: 'views.map',
    router: 'map',
    icon: 'map',
    adminGuard: false,
  },
  {
    label: 'views.data',
    router: 'feed',
    icon: 'data',
    adminGuard: false,
  },
  {
    label: 'views.activity',
    router: 'activity',
    icon: 'activity',
    adminGuard: false,
  },
  {
    label: 'nav.settings',
    router: 'settings',
    icon: 'settings',
    adminGuard: true,
  },
];
