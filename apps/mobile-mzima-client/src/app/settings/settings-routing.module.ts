import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotDeploymentGuard, WalkthroughGuard } from '@guards';
import { SettingsPage } from './settings.page';

const routes: Routes = [
  {
    path: '',
    component: SettingsPage,
    canActivate: [WalkthroughGuard, NotDeploymentGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class SettingsPageRoutingModule {}
