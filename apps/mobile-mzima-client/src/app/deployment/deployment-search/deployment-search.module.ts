import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '@shared';
import { DeploymentPageModule } from '../deployment.module';

import { DeploymentSearchPageRoutingModule } from './deployment-search-routing.module';

import { DeploymentSearchPage } from './deployment-search.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    DeploymentSearchPageRoutingModule,
    SharedModule,
    DeploymentPageModule,
  ],
  declarations: [DeploymentSearchPage],
})
export class DeploymentSearchPageModule {}
