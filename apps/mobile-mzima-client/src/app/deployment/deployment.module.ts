import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeploymentPageRoutingModule } from './deployment-routing.module';
import { SharedModule } from '@shared';

import { DeploymentPage } from './deployment.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeploymentPageRoutingModule,
    SharedModule,
    NgOptimizedImage,
  ],
  declarations: [DeploymentPage],
})
export class DeploymentPageModule {}
