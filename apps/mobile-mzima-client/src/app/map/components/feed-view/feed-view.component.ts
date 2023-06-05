import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GeoJsonFilter, PostResult, PostsService, SavedsearchesService } from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MainViewComponent } from '@shared';
import { SessionService } from '@services';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { lastValueFrom } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-feed-view',
  templateUrl: './feed-view.component.html',
  styleUrls: ['./feed-view.component.scss'],
})
export class FeedViewComponent extends MainViewComponent {
  @Input() public atTop = false;
  @Input() public atBottom = false;
  @Output() postsUpdated = new EventEmitter<{ total: number }>();

  public posts: PostResult[] = [];
  public isPostsLoading = true;
  public totalPosts = 0;
  public override params: GeoJsonFilter = {
    limit: 6,
    page: 1,
  };

  constructor(
    protected override router: Router,
    protected override route: ActivatedRoute,
    protected override postsService: PostsService,
    protected override savedSearchesService: SavedsearchesService,
    protected override sessionService: SessionService,
  ) {
    super(router, route, postsService, savedSearchesService, sessionService);
    this.postsService.postsFilters$.pipe(untilDestroyed(this)).subscribe({
      next: () => {
        this.params.page = 1;
        this.getPosts(this.params);
      },
    });
  }

  loadData(): void {
    this.params.page = 1;
    this.getPosts(this.params);
  }

  private async getPosts(params: any, add = false): Promise<void> {
    this.isPostsLoading = true;
    try {
      const response = await lastValueFrom(this.postsService.getPosts('', { ...params }));
      this.posts = add ? [...this.posts, ...response.results] : response.results;
      this.isPostsLoading = false;
      this.totalPosts = response.meta.total;
      this.postsUpdated.emit({
        total: this.totalPosts,
      });
    } catch (error) {
      console.error('error: ', error);
      this.isPostsLoading = false;
    }
  }

  public async loadMorePosts(ev: any): Promise<void> {
    if (this.totalPosts > this.posts.length && this.params.page) {
      this.params.page++;
      await this.getPosts(this.params, true);
      (ev as InfiniteScrollCustomEvent).target.complete();
    }
  }
}
