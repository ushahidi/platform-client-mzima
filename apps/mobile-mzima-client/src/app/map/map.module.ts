import { NgModule } from '@angular/core';
import { MapPage } from './map.page';
import { MapPageRoutingModule } from './map-routing.module';
import { SharedModule } from '@shared';
import { MapViewModule } from './components/map-view/map-view.module';
import { FiltersFormModule } from './components/filters-form/filters-form.module';
import { FeedViewModule } from './components/feed-view/feed-view.module';
import { DraggableLayoutModule } from './components/draggable-layout/draggable-layout.module';

@NgModule({
  imports: [
    MapPageRoutingModule,
    SharedModule,
    MapViewModule,
    FiltersFormModule,
    FeedViewModule,
    DraggableLayoutModule,
  ],
  declarations: [MapPage],
})
export class MapPageModule {}
