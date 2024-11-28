import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResetComponent } from '@auth';

const routes: Routes = [
  { path: '', component: ResetComponent, data: { breadcrumb: 'nav.password_recovery' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
