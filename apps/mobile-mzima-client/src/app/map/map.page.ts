import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PostsService, SavedsearchesService } from '@mzima-client/sdk';
import { SessionService } from '@services';
import { MainViewComponent } from './components/main-view.component';
import { MapViewComponent } from './components/map-view/map-view.component';
import { FeedViewComponent } from './components/feed-view/feed-view.component';
import { DraggableLayoutComponent } from './components/draggable-layout/draggable-layout.component';

@Component({
  selector: 'app-map',
  templateUrl: 'map.page.html',
  styleUrls: ['map.page.scss'],
})
export class MapPage extends MainViewComponent {
  @ViewChild('layout') public layout: DraggableLayoutComponent;
  @ViewChild('map') public map: MapViewComponent;
  @ViewChild('feed') public feed: FeedViewComponent;
  public mode: number | 'fullscreen';
  public totalPosts = 0;

  constructor(
    protected override router: Router,
    protected override route: ActivatedRoute,
    protected override postsService: PostsService,
    protected override savedSearchesService: SavedsearchesService,
    protected override sessionService: SessionService,
  ) {
    super(router, route, postsService, savedSearchesService, sessionService);
    this.route.params.subscribe(() => {
      this.initCollection();
    });

    this.$destroy.subscribe({
      next: () => {
        this.map.destroy();
        this.feed.destroy();
      },
    });
  }

  loadData(): void {}

  public updatePostsCount(data: any): void {
    this.totalPosts = data.total;
  }

  ionViewWillEnter() {
    this.layout.updateOffsetHeight();
    this.feed.updatePosts();
  }

  public createPost() {
    this.router.navigate(['/post-edit']);
  }
}
