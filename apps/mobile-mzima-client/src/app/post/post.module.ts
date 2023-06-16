import { NgModule } from '@angular/core';
import { PostPage } from './post.page';
import { PipeModule, SharedModule } from '@shared';
import { PostPageRoutingModule } from './post-routing.module';
import { TwitterWidgetModule } from '../map/components/twitter-widget/twitter-widget.module';
import { LocationControlModule } from './components/location-control/location-control.module';

@NgModule({
  imports: [
    SharedModule,
    PostPageRoutingModule,
    TwitterWidgetModule,
    LocationControlModule,
    PipeModule,
  ],
  declarations: [PostPage],
})
export class PostPageModule {}
