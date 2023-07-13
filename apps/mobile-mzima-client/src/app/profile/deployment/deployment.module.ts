import { NgModule } from '@angular/core';
import { DeploymentPage } from './deployment.page';
import { DeploymentPageRoutingModule } from './deployment-routing.module';
import { SharedModule } from '@shared';

@NgModule({
  imports: [DeploymentPageRoutingModule, SharedModule],
  declarations: [DeploymentPage],
})
export class DeploymentPageModule {}
