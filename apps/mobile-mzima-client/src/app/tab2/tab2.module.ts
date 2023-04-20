import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponentModule } from '../components/explore-container/explore-container.module';
import { Tab2Page } from './tab2.page';
import { Tab2PageRoutingModule } from './tab2-routing.module';

@NgModule({
  imports: [IonicModule, CommonModule, Tab2PageRoutingModule, ExploreContainerComponentModule],
  declarations: [Tab2Page],
})
export class Tab2PageModule {}
