import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';

import { DeploymentSearchPageRoutingModule } from './deployment-search-routing.module';

import { DeploymentSearchPage } from './deployment-search.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeploymentSearchPageRoutingModule,
    SharedModule,
  ],
  declarations: [DeploymentSearchPage],
})
export class DeploymentSearchPageModule {}
