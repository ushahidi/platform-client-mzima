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
  private isConnection = true;

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

  private initNetworkListener() {
    this.networkService.networkStatus$.pipe(untilDestroyed(this)).subscribe({
      next: (value) => {
        this.isConnection = value;
      },
    });
  }

  private initFilterListener() {
    this.postsService.postsFilters$.pipe(debounceTime(500), takeUntil(this.$destroy)).subscribe({
      next: () => {
        this.params.page = 1;
        this.getPosts(this.params);
      },
    });
  }

  loadData(): void {}

  private async getPosts(params: any, add = false): Promise<void> {
    console.log('getPosts');
    this.isPostsLoading = true;
    try {
      const response = await lastValueFrom(this.postsService.getPosts('', { ...params }));
      await this.databaseService.set(STORAGE_KEYS.POSTS, response);
      this.postDisplayProcessing(response, add);
    } catch (error) {
      console.error('error: ', error);
      const response = await this.databaseService.get(STORAGE_KEYS.POSTS);
      this.postDisplayProcessing(response, add);
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

  public destroy(): void {
    this.$destroy.next(null);
    this.$destroy.complete();
  }
}
