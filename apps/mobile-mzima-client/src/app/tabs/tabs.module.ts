import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TabsPage } from './tabs.page';
import { TabsPageRoutingModule } from './tabs-routing.module';

@NgModule({
  imports: [IonicModule, CommonModule, TabsPageRoutingModule],
  declarations: [TabsPage],
})
export class TabsPageModule {}
