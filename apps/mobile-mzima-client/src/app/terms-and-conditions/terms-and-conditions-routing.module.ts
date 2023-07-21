import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TermsAndConditionsPage } from './terms-and-conditions.page';

const routes: Routes = [
  {
    path: '',
    component: TermsAndConditionsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TermsAndConditionsPageRoutingModule {}
