import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { STORAGE_KEYS } from '@constants';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import {
  GeoJsonFilter,
  MediaService,
  PostApiResponse,
  PostResult,
  PostsService,
  SavedsearchesService,
} from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DatabaseService, NetworkService, SessionService } from '@services';
import { debounceTime, distinctUntilChanged, lastValueFrom, Subject, takeUntil } from 'rxjs';
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
    private mediaService: MediaService,
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
      await this.updateObjectsWithUploadInput(response);

      const currentPosts = await this.databaseService.get(STORAGE_KEYS.POSTS);
      if (currentPosts && currentPosts.results) {
        const currentPostIds = currentPosts.results.map((post: any) => post.id);
        const newResults = response.results.filter(
          (result: any) => !currentPostIds.includes(result.id),
        );
        currentPosts.results = currentPosts.results.concat(newResults);
        currentPosts.results.sort((a: any, b: any) => b.id - a.id);
        currentPosts.count = currentPosts.results.length;
        await this.databaseService.set(STORAGE_KEYS.POSTS, currentPosts);
      } else {
        await this.databaseService.set(STORAGE_KEYS.POSTS, response);
      }

      this.postDisplayProcessing(response, add);
    } catch (error) {
      console.error('error: ', error);
      const response = await this.databaseService.get(STORAGE_KEYS.POSTS);
      if (response) this.postDisplayProcessing(response, false);
    }
  }

  async updateObjectsWithUploadInput(response: any) {
    const uploadPromises = response.results.flatMap((result: any) => {
      return result.post_content.flatMap((postContent: any) => {
        return postContent.fields
          .filter((field: any) => field.input === 'upload')
          .map((field: any) => this.getMediaDataAndUpdateValue(field));
      });
    });

    await Promise.all(uploadPromises);
  }

  async getMediaDataAndUpdateValue(field: any) {
    if (!field.value?.value) return field;
    try {
      const uploadObservable: any = await this.mediaService.getById(field.value.value);
      const response: any = await lastValueFrom(uploadObservable);

      field.value = {
        ...field.value,
        caption: response.caption,
        photoUrl: response.original_file_url,
      };
    } catch (e) {
      console.error('An error occurred: ', e);
      console.log(field);
      field.value = {
        ...field.value,
        caption: null,
        photoUrl: null,
      };
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
