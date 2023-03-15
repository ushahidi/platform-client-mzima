import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  AdminGuard,
  CombinedGuard,
  DataImportExportGuard,
  ManageSettingsGuard,
  ManageUsersGuard,
} from '@guards';
import { SettingsLayoutComponent } from './settings-layout.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsLayoutComponent,
    children: [
      {
        path: 'general',
        loadChildren: () => import('./general/general.module').then((m) => m.GeneralModule),
        canActivate: [CombinedGuard],
        data: {
          breadcrumb: 'General',
          guards: [AdminGuard, ManageSettingsGuard],
        },
      },
      {
        path: 'surveys',
        loadChildren: () => import('./surveys/surveys.module').then((m) => m.SurveysModule),
        canActivate: [CombinedGuard],
        data: {
          breadcrumb: 'Surveys',
          guards: [AdminGuard, ManageSettingsGuard],
        },
      },
      {
        path: 'data-sources',
        loadChildren: () =>
          import('./data-sources/data-sources.module').then((m) => m.DataSourcesModule),
        canActivate: [CombinedGuard],
        data: {
          breadcrumb: 'Data sources',
          guards: [AdminGuard, ManageSettingsGuard],
        },
      },
      {
        path: 'data-import',
        loadChildren: () =>
          import('./data-import/data-import.module').then((m) => m.DataImportModule),
        canActivate: [CombinedGuard],
        data: {
          breadcrumb: 'Data import',
          guards: [AdminGuard, DataImportExportGuard],
        },
      },
      {
        path: 'donation',
        loadChildren: () => import('./donation/donation.module').then((m) => m.DonationModule),
        canActivate: [CombinedGuard],
        data: {
          breadcrumb: 'Donation',
          guards: [AdminGuard, ManageSettingsGuard],
        },
      },
      {
        path: 'user-settings',
        loadChildren: () =>
          import('./user-settings/user-settings.module').then((m) => m.UserSettingsModule),
        canActivate: [CombinedGuard],
        data: {
          breadcrumb: 'Configure HDX API',
          guards: [AdminGuard, ManageUsersGuard, ManageSettingsGuard, DataImportExportGuard],
        },
      },
      {
        path: 'data-export',
        loadChildren: () =>
          import('./data-export/data-export.module').then((m) => m.DataExportModule),
        canActivate: [CombinedGuard],
        data: {
          breadcrumb: 'Data export',
          guards: [AdminGuard, DataImportExportGuard],
        },
      },
      {
        path: 'users',
        loadChildren: () => import('./users/users.module').then((m) => m.UsersModule),
        canActivate: [CombinedGuard],
        data: {
          breadcrumb: 'Users',
          guards: [AdminGuard, ManageUsersGuard],
        },
      },
      {
        path: 'roles',
        loadChildren: () => import('./roles/roles.module').then((m) => m.RolesModule),
        canActivate: [CombinedGuard],
        data: { breadcrumb: 'Roles' },
      },
      {
        path: 'categories',
        loadChildren: () =>
          import('./categories/categories.module').then((m) => m.CategoriesModule),
        canActivate: [CombinedGuard],
        data: { breadcrumb: 'Categories', guards: [AdminGuard, ManageSettingsGuard] },
      },
      {
        path: 'webhooks',
        loadChildren: () => import('./webhooks/webhooks.module').then((m) => m.WebhooksModule),
        canActivate: [CombinedGuard],
        data: {
          breadcrumb: 'Webhooks',
          guards: [AdminGuard, ManageSettingsGuard],
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
