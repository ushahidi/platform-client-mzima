import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GeneralComponent } from './general.component';
import { DeactivateGuardService } from '../../core/guards/deactivate-settings-route.guard';

const routes: Routes = [
  { path: '', component: GeneralComponent, canDeactivate: [DeactivateGuardService] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GeneralRoutingModule {}
