import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivacyPolicyPage } from './privacy-policy.page';

const routes: Routes = [
  {
    path: '',
    component: PrivacyPolicyPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class PrivacyPolicyPageRoutingModule {}
