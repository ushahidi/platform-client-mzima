import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { STORAGE_KEYS } from '@constants';
import {
  GeoJsonFilter,
  PostApiResponse,
  PostResult,
  PostsService,
  SavedsearchesService,
} from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DatabaseService, NetworkService, SessionService } from '@services';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { Subject, debounceTime, distinctUntilChanged, lastValueFrom, takeUntil } from 'rxjs';
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
  public isConnection = true;
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
    private databaseService: DatabaseService,
    private networkService: NetworkService,
  ) {
    super(router, route, postsService, savedSearchesService, sessionService);
    this.initNetworkListener();
    this.initFilterListener();
  }

  ionViewDidLeave(): void {
    this.posts = [];
  }

  private initNetworkListener() {
    this.networkService.networkStatus$
      .pipe(distinctUntilChanged(), untilDestroyed(this))
      .subscribe({
        next: (value) => {
          this.isConnection = value;
          if (this.isConnection) {
            this.getPosts(this.params);
          }
        },
      });
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
      await this.databaseService.set(STORAGE_KEYS.POSTS, response);
      this.postDisplayProcessing(response, add);
    } catch (error) {
      console.error('error: ', error);
      const response = await this.databaseService.get(STORAGE_KEYS.POSTS);
      if (response) {
        this.postDisplayProcessing(response, add);
      }
    }
  }

  postDisplayProcessing(response: PostApiResponse, add: boolean) {
    this.posts = add ? [...this.posts, ...response.results] : response.results;
    this.isPostsLoading = false;
    this.totalPosts = response.meta.total;
    this.postsUpdated.emit({
      total: this.totalPosts,
    });
  }

  public async loadMorePosts(ev: any): Promise<void> {
    if (this.isConnection && this.totalPosts > this.posts.length && this.params.page) {
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
