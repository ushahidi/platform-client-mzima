import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponentModule } from '../components/explore-container/explore-container.module';
import { Tab3Page } from './tab3.page';
import { Tab3PageRoutingModule } from './tab3-routing.module';

@NgModule({
  imports: [IonicModule, CommonModule, Tab3PageRoutingModule, ExploreContainerComponentModule],
  declarations: [Tab3Page],
})
export class Tab3PageModule {}
