import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsLayoutComponent } from './settings-layout.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsLayoutComponent,
    children: [
      {
        path: '',
        component: SettingsComponent,
        data: { breadcrumb: 'Settings' },
      },
      {
        path: 'general',
        loadChildren: () => import('./general/general.module').then((m) => m.GeneralModule),
        data: { breadcrumb: 'General' },
      },
      {
        path: 'surveys',
        loadChildren: () => import('./surveys/surveys.module').then((m) => m.SurveysModule),
        data: { breadcrumb: 'Surveys' },
      },
      {
        path: 'data-sources',
        loadChildren: () =>
          import('./data-sources/data-sources.module').then((m) => m.DataSourcesModule),
        data: { breadcrumb: 'Data sources' },
      },
      {
        path: 'data-import',
        loadChildren: () =>
          import('./data-import/data-import.module').then((m) => m.DataImportModule),
        data: { breadcrumb: 'Data import' },
      },
      {
        path: 'donation',
        loadChildren: () => import('./donation/donation.module').then((m) => m.DonationModule),
        data: { breadcrumb: 'Donation' },
      },
      {
        path: 'user-settings',
        loadChildren: () =>
          import('./user-settings/user-settings.module').then((m) => m.UserSettingsModule),
        data: { breadcrumb: 'User settings' },
      },
      {
        path: 'data-export',
        loadChildren: () =>
          import('./data-export/data-export.module').then((m) => m.DataExportModule),
        data: { breadcrumb: 'Data export' },
      },
      {
        path: 'users',
        loadChildren: () => import('./users/users.module').then((m) => m.UsersModule),
        data: { breadcrumb: 'Users' },
      },
      {
        path: 'roles',
        loadChildren: () => import('./roles/roles.module').then((m) => m.RolesModule),
        data: { breadcrumb: 'Roles' },
      },
      {
        path: 'categories',
        loadChildren: () =>
          import('./categories/categories.module').then((m) => m.CategoriesModule),
        data: { breadcrumb: 'Categories' },
      },
      {
        path: 'webhooks',
        loadChildren: () => import('./webhooks/webhooks.module').then((m) => m.WebhooksModule),
        data: { breadcrumb: 'Webhooks' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
