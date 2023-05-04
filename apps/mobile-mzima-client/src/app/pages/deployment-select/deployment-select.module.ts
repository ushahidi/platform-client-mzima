import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { CustomInputComponent } from '../../components/custom-input/custom-input.component';

import { DeploymentSelectPageRoutingModule } from './deployment-select-routing.module';

import { DeploymentSelectPage } from './deployment-select.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeploymentSelectPageRoutingModule,
    NgOptimizedImage,
    CustomInputComponent,
  ],
  declarations: [DeploymentSelectPage],
})
export class DeploymentSelectPageModule {}
