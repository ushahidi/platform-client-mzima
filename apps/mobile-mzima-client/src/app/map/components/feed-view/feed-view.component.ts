import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GeoJsonFilter, PostResult, PostsService, SavedsearchesService } from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MainViewComponent } from '@shared';
import { SessionService } from '@services';

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
  public postCurrentLength = 0;
  public override params: GeoJsonFilter = {
    limit: 20,
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
        this.getPosts(this.params);
      },
    });
  }

  loadData(): void {
    this.params.page = 1;
    this.getPosts(this.params);
  }

  private getPosts(params: any): void {
    this.isPostsLoading = true;
    this.postsService.getPosts('', { ...params }).subscribe({
      next: (response) => {
        this.posts = [...this.posts, ...response.results];
        this.postCurrentLength = response.count;
        this.isPostsLoading = false;
        this.postsUpdated.emit({
          total: response.meta.total,
        });
      },
    });
  }
}
