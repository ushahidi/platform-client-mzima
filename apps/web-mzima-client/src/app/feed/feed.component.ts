import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router, NavigationEnd } from '@angular/router';
import { Permissions } from '@enums';
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
import {
  SavedsearchesService,
  PostsService,
  GeoJsonFilter,
  PostResult,
  PostStatus,
  postHelpers,
} from '@mzima-client/sdk';
import _ from 'lodash';

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
    include_unstructured_posts: true,
    // created_before_by_id: '',
  };
  private readonly getPostsSubject = new Subject<{
    params: GeoJsonFilter;
    add?: boolean;
  }>();
  public pagination = {
    page: 1,
    size: this.params.limit,
  };
  public postsSkeleton = new Array(20).fill(''); // used for Post mode's skeleton loader
  public posts: PostResult[] = [];
  public postCurrentLength = 0;
  public isLoading: boolean = true;
  public atLeastOnePostExists: boolean;
  public noPostsYet: boolean = false;
  public loadingMorePosts: boolean;
  public paginationElementsAllowed: boolean = false;
  public mode: FeedMode = FeedMode.Tiles;
  public activePostId: number;
  public total: number;
  public postDetails?: PostResult;
  public isPostLoading: boolean;
  public isFiltersVisible: boolean;
  public isBulkOptionsVisible: boolean;
  public selectedPosts: PostResult[] = [];
  public statuses = searchFormHelper.statuses;
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
  public isManagePosts: boolean;
  public statusControl = new FormControl();
  public initialLoad = true;

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
    private snackBar: MatSnackBar,
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
      this.activePostId = Number(this.router.url.match(/\/(\d+)\/[^\/]+$/)?.[1]);
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
        this.isLoading = true; // "There are no posts yet!" flicker is fixed here and for (most) places where isLoading is set to true
        if (this.initialLoad) {
          this.initialLoad = false;
          return;
        }
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
    this.checkPermission();
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

    this.eventBusService
      .on(EventType.DeletedPost)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (post) => {
          this.postDeleted([post], 0);
        },
      });
  }

  private checkPermission() {
    this.isManagePosts = this.user.permissions?.includes(Permissions.ManagePosts) ?? false;
  }

  loadData(): void {
    // this.params.page = 1;
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
    this.currentFeedViewMode().set;
    const isPostsAlreadyExist = !!this.posts.length;
    if (!add) {
      this.posts = [];
    }
    // if (this.mode === FeedMode.Post) {
    //   this.currentPage = 1;
    // }

    //---------------------------------
    this.isLoading = !this.posts.length; // With this skeleton loader shows up only on mode switch, and the loadmore button is able to detect to not load the skeleton UI loader on click
    this.paginationElementsAllowed = this.loadingMorePosts; // this check prevents the load more button & area from temporarily disappearing (on click) [also prevents pagination element flicker in TILES mode]
    //----------------------------------
    this.postsService.getPosts('', { ...params, ...this.activeSorting }).subscribe({
      next: (data) => {
        this.posts = add ? [...this.posts, ...data.results] : data.results;
        const dataMetaPerPage = Number(data.meta.per_page);
        this.postCurrentLength =
          data.count < dataMetaPerPage ? data.meta.total : data.meta.current_page * data.count;
        this.eventBusService.next({
          type: EventType.FeedPostsLoaded,
          payload: true,
        });
        setTimeout(() => {
          //---------------------------------
          // These are needed to achieve clean display of posts or message on the UI
          this.isLoading = false;
          this.atLeastOnePostExists = this.posts.length > 0;
          this.noPostsYet = !this.atLeastOnePostExists; // && this.mode === FeedMode.Tiles;
          this.loadingMorePosts = false; // for load more button's loader/spinner
          //---------------------------------
          this.updateMasonry();
          setTimeout(() => {
            if (this.mode === FeedMode.Post && !isPostsAlreadyExist) {
              document.querySelector('.post--selected')?.scrollIntoView();
            }
          }, 250);
        }, 500);
        setTimeout(() => {
          //is inside this much delayed setTimeout to prevent pagination elements flicker on load/routing
          this.paginationElementsAllowed = data.meta.total > dataMetaPerPage; // show pagination-related elements
        }, 2100);
      },
    });
  }

  public updateMasonry(): void {
    this.masonry?.layout();
  }

  public pageChanged(page: any): void {
    this.pagination.page = page;
    this.params.page = page;
    this.getPostsSubject.next({ params: this.params });
  }

  public setIsLoadingOnCardClick() {
    // With this skeleton loader's css is properly displayed (when navigating to POST mode) through post card click,
    // and the post card is able to detect to not load the skeleton UI loader after posts have successfully shown up
    this.posts.length && this.mode === FeedMode.Tiles
      ? (this.isLoading = true)
      : this.isLoading === !this.posts.length;
  }

  public showPostDetails(post: any): void {
    if (this.isDesktop) {
      this.setIsLoadingOnCardClick();
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
        data: { post: post, color: post.color, twitterId: post.data_source_message_id },
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
    }
  }

  public toggleBulkOptions(state: boolean): void {
    this.isBulkOptionsVisible = state;
    if (!this.isBulkOptionsVisible) {
      this.deselectAllPosts();
    }
  }

  public changePostsStatus(status: string): void {
    if (status === PostStatus.Published) {
      const uncompletedPosts: PostResult[] = this.selectedPosts.filter(
        (post: PostResult) => !postHelpers.isAllRequiredCompleted(post),
      );

      if (uncompletedPosts.length > 0) {
        this.showMessage(
          this.translate.instant('notify.post.posts_can_t_be_published', {
            titles: uncompletedPosts.map((p) => p.title).join(', '),
          }),
          'error',
          5000,
        );
        this.statusControl.reset();
        return;
      }
    }

    forkJoin(
      this.selectedPosts.map((p: PostResult) => this.postsService.update(p.id, { status })),
    ).subscribe({
      complete: () => {
        this.getPostsSubject.next({ params: this.params, add: false });
        this.statusControl.reset();
        this.deselectAllPosts();
      },
    });
  }

  public selectAllPosts(): void {
    this.posts.map((post) => {
      if (this.selectedPosts.find((selectedPost: PostResult) => selectedPost.id === post.id))
        return;
      this.selectedPosts.push(post);
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
    forkJoin(this.selectedPosts.map((p: PostResult) => this.postsService.delete(p.id))).subscribe({
      complete: () => {
        this.postDeleted(this.selectedPosts, count);
      },
    });
  }

  public postDeleted(posts: PostResult[], count?: number): void {
    this.getPostsSubject.next({ params: this.params, add: false });
    if (this.activePostId && posts.some((p: PostResult) => p.id === this.activePostId)) {
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
      this.eventBusService.next({
        type: EventType.RefreshSurveysCounters,
        payload: true,
      });
    }
  }

  public postStatusChanged(): void {
    this.getPostsSubject.next({ params: this.params, add: false });
    this.selectedPosts = [];
  }

  public isPostSelected(isChecked: boolean, post: PostResult): void {
    if (isChecked) {
      this.selectedPosts.push(post);
    } else {
      const index = this.selectedPosts.findIndex((p: PostResult) => p.id === post.id);
      if (index > -1) {
        this.selectedPosts.splice(index, 1);
      }
    }
  }

  public isPostChecked(post: PostResult): boolean {
    return !!this.selectedPosts.find((p: PostResult) => p.id === post.id);
  }

  public sortPosts(value: any): void {
    this.activeSorting = value;
    this.postsService.setSorting(this.activeSorting);
    this.getPostsSubject.next({ params: this.params, add: false });
  }

  public refreshMasonry(): void {
    this.isLoading = true;
    this.updateMasonryLayout = !this.updateMasonryLayout;
  }

  public loadMore(): void {
    if (this.params.limit !== undefined && this.params.limit * this.params.page! < this.total) {
      this.loadingMorePosts = true;
      this.params.page! += 1;
      this.getPostsSubject.next({ params: this.params });
    }
  }

  public toggleFilters(value: boolean): void {
    if (value === this.isFiltersVisible) return;
    this.isFiltersVisible = value;
    this.sessionService.toggleFiltersVisibility(value);
  }

  public currentFeedViewMode() {
    return {
      get: localStorage.getItem('ui_feed_mode'),
      set: localStorage.setItem('ui_feed_mode', this.mode),
    };
  }

  public switchMode(mode: FeedMode): void {
    // 1. If there are no posts "The switch buttons shouldn't 'try to work'"
    // Reason is because the switch buttons alongside all other elements disabled when the page is still loading, shouldn't even show up in the first place) [when there are no posts].
    // So the check is a defense for or "validation" against errors that may occur from clicking it - if the button shows up by mistake when it's not supposed to [when there are no posts].

    // 2. The switch mode button of the mode you are on should also not work if you click on it while in that mode
    const localStorageFeedMode = this.currentFeedViewMode().get;
    const sameSwitchButtonClicked = localStorageFeedMode === mode;
    if (this.atLeastOnePostExists && !sameSwitchButtonClicked) {
      //-------------------------------------
      // Show loader & prevent pagination elements flicker on use of switch mode buttons
      this.isLoading = true;
      this.paginationElementsAllowed = false;
      //-------------------------------------
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
      const updatedPost = _.cloneDeep(p);
      this.posts = this.posts.map((obj) => (obj.id === updatedPost.id ? updatedPost : obj));
    });
  }

  public changePage(page: number): void {
    // --------------------------------
    // Show loader & prevent pagination elements flicker on use of pagination element's buttons
    this.isLoading = true;
    this.paginationElementsAllowed = false;
    //------------------------------------
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

  public showPostModal(id: number): void {
    this.postsService.getById(id).subscribe({
      next: (post: any) => {
        this.showPostDetails(post);
      },
      error: (err) => {
        // console.log(err.status);
        if (err.status === 404) {
          this.router.navigate(['/not-found']);
        }
      },
    });
  }

  public editPost(post: any): void {
    if (this.isDesktop) {
      this.setIsLoadingOnCardClick();
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

  private showMessage(message: string, type: string, duration = 3000) {
    this.snackBar.open(message, 'Close', {
      panelClass: [type],
      duration,
    });
  }
}
