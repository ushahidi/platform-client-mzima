import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TruncateModule } from '../core/pipes';

import { DeploymentPageRoutingModule } from './deployment-routing.module';
import { SharedModule } from '@shared';

import { DeploymentPage } from './deployment.page';
import { LogoComponent } from './components/logo/logo.component';
import { DeploymentSearchBtnComponent } from './components/deployment-search-btn/deployment-search-btn.component';
import { DeploymentItemComponent } from './components/deployment-item/deployment-item.component';

const components = [LogoComponent, DeploymentSearchBtnComponent, DeploymentItemComponent];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeploymentPageRoutingModule,
    SharedModule,
    NgOptimizedImage,
    TruncateModule,
  ],
  declarations: [DeploymentPage, ...components],
  exports: [DeploymentItemComponent],
})
export class DeploymentPageModule {}
