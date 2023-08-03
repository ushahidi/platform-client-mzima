import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router, NavigationEnd } from '@angular/router';
import { searchFormHelper } from '@helpers';
import { TranslateService } from '@ngx-translate/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NgxMasonryComponent, NgxMasonryOptions } from 'ngx-masonry';
import { filter, forkJoin, Subject, debounceTime } from 'rxjs';
import { PostDetailsModalComponent } from '../map';
import { MainViewComponent } from '@shared';
import { SessionService, BreakpointService, EventBusService, EventType } from '@services';
import { ConfirmModalService } from '../core/services/confirm-modal.service';
import { LanguageService } from '../core/services/language.service';
import { SavedsearchesService, PostsService, GeoJsonFilter, PostResult } from '@mzima-client/sdk';

enum FeedMode {
  Tiles = 'TILES',
  Post = 'POST',
}

@UntilDestroy()
@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent extends MainViewComponent implements OnInit {
  @ViewChild('feed') public feed: ElementRef;
  @ViewChild('masonry') public masonry: NgxMasonryComponent;
  public override params: GeoJsonFilter = {
    limit: 20,
    page: 1,
    // created_before_by_id: '',
  };
  private readonly getPostsSubject = new Subject<{ params: GeoJsonFilter; add?: boolean }>();
  public pagination = {
    page: 1,
    size: this.params.limit,
  };
  public posts: PostResult[] = [];
  public postCurrentLength = 0;
  public isLoading = false;
  public mode: FeedMode = FeedMode.Tiles;
  public activePostId: any;
  public total: number;
  public postDetails?: PostResult;
  public isPostLoading: boolean;
  public isFiltersVisible: boolean;
  public isBulkOptionsVisible: boolean;
  public selectedPosts: string[] = [];
  public statuses = searchFormHelper.statuses;
  public selectedStatus?: string;
  public sortingOptions = searchFormHelper.sortingOptions;
  public activeSorting = {
    order: 'desc',
    orderby: 'created',
  };
  public updateMasonryLayout: boolean;
  private isRTL?: boolean;
  public masonryOptions: NgxMasonryOptions = {
    originLeft: false,
    percentPosition: true,
    resize: true,
    gutter: 0,
    columnWidth: 3,
    fitWidth: false,
    horizontalOrder: true,
  };
  FeedMode = FeedMode;
  public currentPage = 1;
  public itemsPerPage = 20;
  private postDetailsModal: MatDialogRef<PostDetailsModalComponent>;
  public isMainFiltersOpen: boolean;

  constructor(
    protected override router: Router,
    protected override route: ActivatedRoute,
    protected override postsService: PostsService,
    protected override savedSearchesService: SavedsearchesService,
    protected override eventBusService: EventBusService,
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private confirmModalService: ConfirmModalService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private languageService: LanguageService,
  ) {
    super(
      router,
      route,
      postsService,
      savedSearchesService,
      eventBusService,
      sessionService,
      breakpointService,
    );
    this.checkDesktop();
    this.initGetPostsListener();

    if (!this.isDesktop) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          mode: FeedMode.Tiles,
        },
        queryParamsHandling: 'merge',
      });
    } else {
      this.postDetailsModal?.close();
    }

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.activePostId = this.router.url.match(/\/(\d+)\/[^\/]+$/)?.[1];
      if (this.activePostId && !this.isDesktop) {
        this.showPostModal(this.activePostId);
      }
    });

    this.route.params.subscribe(() => {
      this.initCollection();
    });

    this.route.queryParams.subscribe({
      next: (params: Params) => {
        this.currentPage = params['page'] ? Number(params['page']) : 1;
        this.params.page = this.currentPage;
        this.mode = params['mode'] && this.isDesktop ? params['mode'] : FeedMode.Tiles;
        this.posts = [];
        this.getPostsSubject.next({ params: this.params });
      },
    });

    this.postsService.postsFilters$.pipe(untilDestroyed(this)).subscribe({
      next: () => {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {
            page: 1,
          },
          queryParamsHandling: 'merge',
        });
        this.posts = [];
        this.getPostsSubject.next({ params: this.params });
      },
    });

    this.postsService.totalPosts$.pipe(untilDestroyed(this)).subscribe({
      next: (total) => {
        this.total = total;
      },
    });

    this.sessionService.isFiltersVisible$.pipe(untilDestroyed(this)).subscribe({
      next: (isFiltersVisible) => {
        setTimeout(() => {
          this.isFiltersVisible = isFiltersVisible;
        }, 1);
      },
    });

    this.languageService.isRTL$.pipe(untilDestroyed(this)).subscribe({
      next: (isRTL) => {
        if (this.isRTL !== isRTL) {
          this.isRTL = isRTL;
          this.masonryOptions.originLeft = !this.isRTL;
        }
      },
    });

    window.addEventListener('resize', () => {
      this.masonryOptions.columnWidth =
        this.mode === FeedMode.Tiles
          ? window.innerWidth > 1640
            ? 3
            : window.innerWidth <= 768
            ? 1
            : 2
          : 1;
    });

    this.sessionService.isMainFiltersHidden$.pipe(untilDestroyed(this)).subscribe({
      next: (isMainFiltersHidden: boolean) => {
        setTimeout(() => {
          this.isMainFiltersOpen = !isMainFiltersHidden;
        }, 1);
      },
    });
  }

  ngOnInit() {
    this.getUserData();
    this.eventBusListeners();
  }

  private eventBusListeners() {
    this.eventBusService
      .on(EventType.DeleteCollection)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (colId) => {
          if (Number(colId) === Number(this.collectionId)) {
            this.router.navigate(['/feed']);
          }
        },
      });

    this.eventBusService
      .on(EventType.DeleteSavedSearch)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: () => {
          // We can delete search only from edit so redirect anyway
          this.router.navigate(['/feed']);
        },
      });

    this.eventBusService
      .on(EventType.UpdatedPost)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (post) => {
          this.refreshPost(post);
        },
      });

    this.eventBusService
      .on(EventType.EditPost)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (post) => {
          this.editPost(post);
        },
      });
  }

  loadData(): void {
    this.params.page = 1;
    this.getPostsSubject.next({ params: this.params });
  }

  private initGetPostsListener() {
    this.getPostsSubject.pipe(untilDestroyed(this), debounceTime(700)).subscribe({
      next: ({ params, add }) => {
        this.getPosts(params, add);
      },
    });
  }

  private getPosts(params: any, add = true): void {
    if (!add) {
      this.posts = [];
    }
    if (this.mode === FeedMode.Post) {
      this.currentPage = 1;
    }
    this.isLoading = true;
    this.postsService.getPosts('', { ...params, ...this.activeSorting }).subscribe({
      next: (data) => {
        this.posts = add ? [...this.posts, ...data.results] : data.results;
        this.postCurrentLength =
          data.count < Number(data.meta.per_page)
            ? data.meta.total
            : data.meta.current_page * data.count;
        this.eventBusService.next({
          type: EventType.FeedPostsLoaded,
          payload: true,
        });
        setTimeout(() => {
          this.isLoading = false;
          this.masonry?.layout();
        }, 500);
      },
    });
  }

  public pageChanged(page: any): void {
    this.pagination.page = page;
    this.params.page = page;
    this.getPostsSubject.next({ params: this.params });
  }

  public showPostDetails(post: any): void {
    if (this.isDesktop) {
      if (this.collectionId) {
        this.router.navigate(['/feed', 'collection', this.collectionId, post.id, 'view'], {
          queryParams: {
            mode: FeedMode.Post,
          },
          queryParamsHandling: 'merge',
        });
      } else {
        this.router.navigate(['feed', post.id, 'view'], {
          queryParams: {
            mode: FeedMode.Post,
          },
          queryParamsHandling: 'merge',
        });
      }
    } else {
      this.postDetailsModal = this.dialog.open(PostDetailsModalComponent, {
        width: '100%',
        maxWidth: 576,
        data: { color: post.color, twitterId: post.data_source_message_id },
        height: 'auto',
        maxHeight: '90vh',
        panelClass: ['modal', 'post-modal'],
      });

      this.postDetailsModal.afterClosed().subscribe((data) => {
        if (data?.update) {
          this.getPostsSubject.next({ params: this.params });
        }
        if (this.collectionId) {
          this.router.navigate(['/feed', 'collection', this.collectionId], {
            queryParams: {
              page: this.currentPage,
            },
            queryParamsHandling: 'merge',
          });
        } else {
          this.router.navigate(['feed'], {
            queryParams: {
              page: this.currentPage,
            },
            queryParamsHandling: 'merge',
          });
        }
      });

      this.postsService.getById(post.id).subscribe({
        next: (postV5: PostResult) => {
          this.postDetailsModal.componentInstance.post = postV5;
        },
      });
    }
  }

  public toggleBulkOptions(state: boolean): void {
    this.isBulkOptionsVisible = state;
    if (!this.isBulkOptionsVisible) {
      this.deselectAllPosts();
    }
  }

  public changePostsStatus(status: string): void {
    forkJoin(this.selectedPosts.map((p) => this.postsService.update(p, { status }))).subscribe({
      complete: () => {
        this.getPostsSubject.next({ params: this.params, add: false });
        this.selectedStatus = undefined;
        this.deselectAllPosts();
      },
    });
  }

  public selectAllPosts(): void {
    this.posts.map((post) => {
      if (this.selectedPosts.find((selectedPost) => selectedPost === String(post.id))) return;
      this.selectedPosts.push(String(post.id));
    });
  }

  public deselectAllPosts(): void {
    this.selectedPosts = [];
  }

  public async deleteSelectedPosts(): Promise<void> {
    const confirmed = await this.confirmModalService.open({
      title: `${this.translate.instant(
        'app.are_you_sure_you_want_to_delete',
      )} ${this.translate.instant('post.post_count', { count: this.selectedPosts.length })}?`,
      description: this.translate.instant('app.action_cannot_be_undone'),
    });
    if (!confirmed) return;

    const count = this.selectedPosts.length;
    forkJoin(this.selectedPosts.map((p) => this.postsService.delete(p))).subscribe({
      complete: () => {
        this.postDeleted(this.selectedPosts, count);
      },
    });
  }

  public postDeleted(postIds: string[], count?: number): void {
    this.getPostsSubject.next({ params: this.params, add: false });
    if (this.activePostId && postIds.includes(this.activePostId)) {
      if (this.collectionId) {
        this.router.navigate(['feed', 'collection', this.collectionId]);
      } else {
        this.router.navigate(['feed']);
      }
    }
    this.selectedPosts = [];
    if (count) {
      this.confirmModalService.open({
        title: this.translate.instant('notify.confirm_modal.deleted.success'),
        description: `<p>${this.translate.instant(
          'notify.confirm_modal.deleted.success_description',
          { count },
        )}</p>`,
        buttonSuccess: this.translate.instant('notify.confirm_modal.deleted.success_button'),
      });
    }
  }

  public postStatusChanged(): void {
    this.getPostsSubject.next({ params: this.params, add: false });
    this.selectedPosts = [];
  }

  public isPostSelected(isChecked: boolean, id: string): void {
    if (isChecked) {
      this.selectedPosts.push(id);
    } else {
      const index = this.selectedPosts.findIndex((postId) => postId === id);
      if (index > -1) {
        this.selectedPosts.splice(index, 1);
      }
    }
  }

  public isPostChecked(id: string): boolean {
    return !!this.selectedPosts.find((postId) => postId === id);
  }

  public sortPosts(value: any): void {
    this.activeSorting = value;
    this.postsService.setSorting(this.activeSorting);
    this.getPostsSubject.next({ params: this.params, add: false });
  }

  public refreshMasonry(): void {
    this.updateMasonryLayout = !this.updateMasonryLayout;
  }

  public loadMore(): void {
    if (this.params.limit !== undefined && this.params.limit * this.params.page! < this.total) {
      this.currentPage++;
      this.params.page!++;
      this.getPostsSubject.next({ params: this.params });
    }
  }

  public toggleFilters(value: boolean): void {
    if (value === this.isFiltersVisible) return;
    this.isFiltersVisible = value;
    this.sessionService.toggleFiltersVisibility(value);
  }

  public switchMode(mode: FeedMode): void {
    this.mode = mode;
    if (this.collectionId) {
      this.switchCollectionMode();
      return;
    }
    if (this.mode === FeedMode.Post) {
      this.router.navigate(['/feed', this.posts[0].id, 'view'], {
        queryParams: {
          mode: this.mode,
        },
        queryParamsHandling: 'merge',
      });
    } else {
      this.router.navigate(['/feed'], {
        queryParams: {
          mode: this.mode,
        },
        queryParamsHandling: 'merge',
      });
    }
  }

  switchCollectionMode() {
    if (this.mode === FeedMode.Post) {
      this.router.navigate(['/feed', 'collection', this.collectionId, this.posts[0].id, 'view'], {
        queryParams: {
          mode: this.mode,
        },
        queryParamsHandling: 'merge',
      });
    } else {
      this.router.navigate(['/feed', 'collection', this.collectionId], {
        queryParams: {
          mode: this.mode,
        },
        queryParamsHandling: 'merge',
      });
    }
  }

  refreshPost({ id }: PostResult) {
    this.postsService.getById(id).subscribe((p) => {
      const index = this.posts.findIndex((post) => post.id === p.id);
      if (index !== -1) this.posts.splice(index, 1, p);
    });
  }

  public changePage(page: number): void {
    this.toggleBulkOptions(false);
    this.currentPage = page;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.currentPage,
      },
      queryParamsHandling: 'merge',
    });
  }

  public showPostModal(id: string): void {
    this.postsService.getById(id).subscribe({
      next: (post: any) => {
        this.showPostDetails(post);
      },
    });
  }

  public editPost(post: any): void {
    if (this.isDesktop) {
      if (this.collectionId) {
        this.router.navigate(['/feed', 'collection', this.collectionId, post.id, 'edit'], {
          queryParams: {
            mode: FeedMode.Post,
          },
          queryParamsHandling: 'merge',
        });
      } else {
        this.router.navigate(['feed', post.id, 'edit'], {
          queryParams: {
            mode: FeedMode.Post,
          },
          queryParamsHandling: 'merge',
        });
      }
      return;
    }

    this.postDetailsModal = this.dialog.open(PostDetailsModalComponent, {
      width: '100%',
      maxWidth: 576,
      data: {
        editable: true,
        color: post.color,
        twitterId: post.data_source_message_id,
      },
      height: 'auto',
      maxHeight: '90vh',
      panelClass: ['modal', 'post-modal'],
    });

    this.postsService.getById(post.id).subscribe({
      next: (postV5: PostResult) => {
        this.postDetailsModal.componentInstance.post = postV5;
      },
    });

    this.postDetailsModal.afterClosed().subscribe((data) => {
      if (data?.update) {
        this.getPostsSubject.next({ params: this.params, add: false });
      }
    });
  }
}
