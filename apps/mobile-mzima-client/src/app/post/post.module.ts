import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PostComponentsModule } from './components/post-components.module';
import { PostPage } from './post.page';
import { PipeModule, SharedModule } from '@shared';
import { PostPageRoutingModule } from './post-routing.module';
import { TwitterWidgetModule } from '../map/components/twitter-widget/twitter-widget.module';
import { LocationControlModule } from './components/location-control/location-control.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    SharedModule,
    PostPageRoutingModule,
    TwitterWidgetModule,
    LocationControlModule,
    PipeModule,
    MatIconModule,
    PostComponentsModule,
    TranslateModule,
  ],
  declarations: [PostPage],
})
export class PostPageModule {}
