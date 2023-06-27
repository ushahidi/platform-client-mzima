import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GeoJsonFilter, PostResult, PostsService, SavedsearchesService } from '@mzima-client/sdk';
import { UntilDestroy } from '@ngneat/until-destroy';
import { SessionService } from '@services';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { Subject, debounceTime, lastValueFrom, takeUntil } from 'rxjs';
import { MainViewComponent } from '../main-view.component';

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
  public override $destroy = new Subject();
  public sorting = 'created?desc';
  public sortingOptions = [
    {
      label: 'Date created (Newest first)',
      value: 'created?desc',
    },
    {
      label: 'Date created (Oldest first)',
      value: 'created?asc',
    },
    {
      label: 'Post date (Newest first)',
      value: 'post_date?desc',
    },
    {
      label: 'Post date (Oldest first)',
      value: 'post_date?asc',
    },
    {
      label: 'Date updated (Newest first)',
      value: 'updated?desc',
    },
    {
      label: 'Date updated (Oldest first)',
      value: 'updated?asc',
    },
  ];

  constructor(
    protected override router: Router,
    protected override route: ActivatedRoute,
    protected override postsService: PostsService,
    protected override savedSearchesService: SavedsearchesService,
    protected override sessionService: SessionService,
  ) {
    super(router, route, postsService, savedSearchesService, sessionService);

    this.initFilterListener();
  }

  private initFilterListener() {
    this.postsService.postsFilters$.pipe(debounceTime(500), takeUntil(this.$destroy)).subscribe({
      next: () => {
        this.updatePosts();
      },
    });
  }

  loadData(): void {}

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

  public handlePostDeleted(data: any): void {
    this.posts.splice(
      this.posts.findIndex((p) => p.id === data.post.id),
      1,
    );
    this.totalPosts--;
    this.postsUpdated.emit({
      total: this.totalPosts,
    });
  }

  public showPost(id: string): void {
    this.router.navigate([id]);
  }

  public sortPosts(): void {
    this.isPostsLoading = true;
    this.postsService.setSorting({
      orderby: this.sorting.split('?')[0],
      order: this.sorting.split('?')[1],
    });
    this.updatePosts();
  }

  public updatePosts(): void {
    this.params.page = 1;
    this.getPosts(this.params);
  }

  public destroy(): void {
    this.$destroy.next(null);
    this.$destroy.complete();
  }
}
