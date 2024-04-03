import { Component, Input } from '@angular/core';
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
  CollectionsService,
} from '@mzima-client/sdk';
import { UntilDestroy } from '@ngneat/until-destroy';
import { DatabaseService, EnvService, SessionService } from '@services';
import { lastValueFrom, Subject } from 'rxjs';
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

  public posts: PostResult[] = [];
  public isPostsLoading = true;
  public totalPosts = 0;
  public override params: GeoJsonFilter = {
    limit: 20,
    page: 1,
  };
  public destroy$ = new Subject();
  public isConnection = true;
  public sorting = 'created?desc';
  public isCollection = false;
  public collectionName: string;
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
    private mediaService: MediaService,
    private envService: EnvService,
    private collectionService: CollectionsService,
  ) {
    super(router, route, postsService, savedSearchesService, sessionService);
    this.envService.deployment$.subscribe({
      next: () => {
        this.posts = [];
      },
    });
    if (this.route.snapshot.data['view'] === 'collection') {
      this.openCollection();
    }
  }

  openCollection() {
    const collectionId: any = this.route.snapshot.paramMap.get('id');
    this.collectionService.getCollection(collectionId).subscribe((result: any) => {
      this.isCollection = true;
      this.collectionName = result.result.name;
    });
  }

  removeCollection() {
    this.postsService.applyFilters({
      ...this.postsService.normalizeFilter(this.filters),
    });
    this.router.navigate(['/']);
    this.isCollection = false;
    this.collectionName = '';
  }

  ionViewDidLeave(): void {
    this.posts = [];
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
        currentPosts.meta.total = response.meta.total;
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
        mediaCaption: response.result.caption,
        mediaSrc: response.result.original_file_url,
      };
    } catch (e) {
      console.error('An error occurred: ', e);
      console.log(field);
      field.value = {
        ...field.value,
        mediaCaption: null,
        mediaSrc: null,
      };
    }
  }

  postDisplayProcessing(response: PostApiResponse, add: boolean) {
    this.posts = add ? [...this.posts, ...response.results] : response.results;
    this.isPostsLoading = false;
    this.totalPosts = response.meta.total;
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

  public createPost() {
    this.router.navigate(['/post-edit']);
  }

  public destroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
