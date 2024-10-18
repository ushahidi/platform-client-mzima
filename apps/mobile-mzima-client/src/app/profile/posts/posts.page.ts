import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GeoJsonFilter, PostApiResponse, PostResult, PostsService } from '@mzima-client/sdk';
import { STORAGE_KEYS } from '@constants';
import { Subject, debounceTime, distinctUntilChanged, lastValueFrom } from 'rxjs';
import { DatabaseService, NetworkService, SessionService } from '@services';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { InfiniteScrollCustomEvent } from '@ionic/angular';

@UntilDestroy()
@Component({
  selector: 'app-posts',
  templateUrl: 'posts.page.html',
  styleUrls: ['posts.page.scss'],
})
export class PostsPage {
  private params: GeoJsonFilter = {
    limit: 6,
    page: 1,
    q: '',
    currentView: 'myposts',
  };
  public isPostsLoading = false;
  public posts: PostResult[] = [];
  public selectedPosts: PostResult[] = [];
  public totalPosts = 0;
  public isConnection = true;
  private readonly searchSubject = new Subject<string>();
  public isEditMode = false;
  public permissions: string[] = ['add_to_collection', 'edit'];
  private user: { id?: string; role?: string } = {
    id: undefined,
    role: undefined,
  };

  constructor(
    private router: Router,
    private postsService: PostsService,
    private databaseService: DatabaseService,
    private networkService: NetworkService,
    protected sessionService: SessionService,
  ) {
    this.sessionService.currentUserData$.pipe(untilDestroyed(this)).subscribe({
      next: ({ userId, role }) => {
        this.user = {
          id: userId ? String(userId) : undefined,
          role,
        };
        this.checkPermissions();
      },
    });

    this.initNetworkListener();

    this.searchSubject.pipe(debounceTime(500)).subscribe({
      next: (q: string) => {
        this.params.q = q;
        if (this.isEditMode) {
          this.editPosts();
        }
        this.getMyPosts(true);
      },
    });
  }

  ionViewWillEnter(): void {
    this.getMyPosts(false, true);
  }

  ionViewDidLeave(): void {
    this.isEditMode = false;
  }

  private initNetworkListener() {
    this.networkService.networkStatus$
      .pipe(distinctUntilChanged(), untilDestroyed(this))
      .subscribe({
        next: (value) => {
          this.isConnection = value;
          if (this.isConnection) {
            this.getMyPosts(false, true);
          }
        },
      });
  }

  public async getMyPosts(reset = false, reloadAll = false): Promise<void> {
    this.isPostsLoading = true;
    if (reset) {
      this.params.page = 1;
      this.posts = [];
    }

    const originalPage = this.params.page ?? 1;
    const originalLimit = this.params.limit ?? 6;

    if (reloadAll) {
      this.params.limit = (this.params.page ?? 1) * (this.params.limit ?? 6);
      this.params.page = 1;
    }

    try {
      const response = await lastValueFrom(this.postsService.getMyPosts('', this.params));
      await this.databaseService.set(STORAGE_KEYS.POSTS, response);
      this.postDisplayProcessing(response, !reset && !reloadAll);
    } catch (error) {
      console.error('error: ', error);
      const response = await this.databaseService.get(STORAGE_KEYS.POSTS);
      if (response) {
        this.postDisplayProcessing(response, !reset && !reloadAll);
      }
    } finally {
      if (reloadAll) {
        this.params.limit = originalLimit;
        this.params.page = originalPage;
      }
      this.isPostsLoading = false;
    }
  }

  postDisplayProcessing(response: PostApiResponse, add: boolean) {
    this.posts = add ? [...this.posts, ...response.results] : response.results;
    this.totalPosts = response.meta.total;
  }

  public async loadMorePosts(ev: any): Promise<void> {
    if (this.isConnection && this.totalPosts > this.posts.length && this.params.page) {
      this.params.page++;
      await this.getMyPosts();
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

  public handlePostsDeleted(deletedPostIds: any): void {
    this.posts = this.posts.filter((post) => !deletedPostIds.includes(post.id));
    this.totalPosts -= deletedPostIds.length;
    this.isEditMode = false;
  }

  public showPost(id: string): void {
    this.router.navigate([id], { queryParams: { profile: true } });
  }

  public back(): void {
    this.router.navigate(['profile']);
  }

  public searchPosts(q: string): void {
    this.searchSubject.next(q);
  }

  public editPosts(): void {
    this.isEditMode = !this.isEditMode;
    this.selectedPosts = [];
  }

  private checkPermissions(): void {
    if (this.user.role === 'admin') {
      this.permissions.push('change_status');
    } else {
      const i = this.permissions.findIndex((permission) => permission === 'change_status');
      if (i > -1) {
        this.permissions.splice(i, 1);
      }
    }
  }

  public postSelected(state: boolean, post: PostResult): void {
    state
      ? this.selectedPosts.push(post)
      : this.selectedPosts.splice(
          this.selectedPosts.findIndex((p) => p.id === post.id),
          1,
        );
  }
}
