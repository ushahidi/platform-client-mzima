import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeploymentInfoComponent } from './deployment-info.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '@shared';

@NgModule({
  declarations: [DeploymentInfoComponent],
  imports: [CommonModule, IonicModule, SharedModule],
  exports: [DeploymentInfoComponent],
})
export class DeploymentInfoModule {}
