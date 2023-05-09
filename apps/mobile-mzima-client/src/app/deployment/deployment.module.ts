import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { IonicModule } from '@ionic/angular';

import { DeploymentPageRoutingModule } from './deployment-routing.module';
import { SharedModule } from '../shared/shared.module';

import { DeploymentPage } from './deployment.page';
import { LogoComponent } from './components/logo/logo.component';
import { DeploymentSearchBtnComponent } from './components/deployment-search-btn/deployment-search-btn.component';
import { DeploymentListComponent } from './components/deployment-list/deployment-list.component';
import { DeploymentItemComponent } from './components/deployment-item/deployment-item.component';

const components = [
  LogoComponent,
  DeploymentSearchBtnComponent,
  DeploymentListComponent,
  DeploymentItemComponent,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeploymentPageRoutingModule,
    SharedModule,
    NgOptimizedImage,
    MatIconModule,
  ],
  declarations: [DeploymentPage, ...components],
})
export class DeploymentPageModule {}
