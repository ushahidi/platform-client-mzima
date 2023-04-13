import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { NxWelcomeComponentModule } from '../components/nx-welcome/nx-welcome.module';
import { Tab1Page } from './tab1.page';
import { Tab1PageRoutingModule } from './tab1-routing.module';

@NgModule({
  imports: [IonicModule, CommonModule, Tab1PageRoutingModule, NxWelcomeComponentModule],
  declarations: [Tab1Page],
})
export class Tab1PageModule {}
