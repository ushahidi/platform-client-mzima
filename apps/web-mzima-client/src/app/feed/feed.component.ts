import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router, NavigationEnd } from '@angular/router';
import { Permissions } from '@enums';
import { searchFormHelper } from '@helpers';
import { TranslateService } from '@ngx-translate/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NgxMasonryComponent, NgxMasonryOptions } from 'ngx-masonry';
import { filter, forkJoin, Subject, Subscription } from 'rxjs';
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

type UserEvent = 'load' | 'click' | 'resize';
type IdModePage = 'view' | 'edit';

@UntilDestroy()
@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent extends MainViewComponent implements OnInit, OnDestroy {
  private _routerEvent = Subscription.EMPTY;
  @ViewChild('feed') public feed: ElementRef;
  @ViewChild('masonry') public masonry: NgxMasonryComponent;
  private readonly getPostsSubject = new Subject<{
    params: GeoJsonFilter;
    add?: boolean;
  }>();
  public pagination = {
    page: 0,
    limit: 20,
  };
  public userEvent: UserEvent = 'load'; // will help the app keep track of if click has happened later on
  public idModePages: ['view', 'edit'] = ['view', 'edit'];
  public idModePageFromRouter = (routerUrl: string) =>
    this.idModePages.filter((string) => routerUrl.includes(`/${string}`))[0] as IdModePage; // will help app keep track of id mode page for use later on resize, after setting on page load
  public onlyModeUIChanged = false;
  public postsSkeleton = new Array(20).fill(''); // used for Post mode's skeleton loader
  public posts: PostResult[] = [];
  public postCurrentLength = 0;
  public isLoading: boolean;
  public atLeastOnePostExists: boolean;
  public noPostsYet: boolean = false;
  public loadingMorePosts: boolean;
  public paginationElementsAllowed: boolean = false;
  public mode: FeedMode = FeedMode.Tiles;
  public activePostId: number;
  public total: number;
  public postDetails?: PostResult;
  public scrollToView: boolean;
  public scrollingID?: number | null;
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
    percentPosition: false, // setting this to false makes mode-related UI transition cleaner, whether on post card/mode switch button or on Data view sidebar Nav button click
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

    this.route.params.subscribe(() => {
      this.initCollection();
    });

    this.route.queryParams.subscribe({
      next: (params: Params) => {
        /* ------------------------------------------------------
          Don't have access to the "NavigationStart" event within
          FeedComponent, therefore setting initial variables here 
          -----------------------------------------------------*/
        /* ------------------------------------------------------
          ID check to determine mode (more reliable than previous 
          method of setting & getting mode from queryParams)
         ------------------------------------------------------*/
        this.activePostId = Number(this.router.url.match(/\/(\d+)\/[^\/]+$/)?.[1]);
        const postModeHint = this.activePostId;
        this.mode = postModeHint ? FeedMode.Post : FeedMode.Tiles;
        //----------------------------------------------

        this.activeCard().scrollCountHandler({ task: 'reset' });

        this.isLoading = !this.onlyModeUIChanged;
        this.paginationElementsAllowed = this.onlyModeUIChanged
          ? this.posts.length >= 20 || this.currentPage > 1
          : !this.posts;

        if (this.isLoading) {
          // this.setupFeedDefaultFilters();
        }

        this.currentPage = params['page'] ? Number(params['page']) : 1;
        this.params.page = this.currentPage;

        /* -------------------------------------------------------------------
          i.e will not empty posts for Post Card and SwitchMode button clicks
        ---------------------------------------------------------------------*/
        if (this.isLoading) {
          this.posts = [];
          this.getPosts(this.params);
        }

        /* -------------------------------------------------------------------
          On using the "switch mode" button to navigate to PREVIEW MODE:
          this restores PREVIEW MODE posts to what it was before,
          if the "load more" button has been used to add more posts in the ID MODE
        ------------------------------------------------------------------- */
        if (this.mode === FeedMode.Tiles && this.onlyModeUIChanged && this.posts.length > 20) {
          this.posts = this.posts.slice(0, 20);
          this.postCurrentLength = this.posts.length * this.currentPage;
        }
      },
    });

    // this.router.events
    //   .pipe(filter((event) => event instanceof NavigationStart))
    //   .subscribe((/*event*/) => {
    //     this.isLoading = false;
    //   });

    this._routerEvent = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((/*event*/) => {
        console.log('isLoading: ', this.isLoading);
        console.log('onlyModeUIChanged: ', this.onlyModeUIChanged);

        this.activeCard().slideOutHandler();
        this.activeCard().scrollCountHandler({ task: 'increment' });
        this.activeCard().scrollToView();

        if (this.mode === FeedMode.Post) {
          // Note: Without this event check, clicking on card will also trigger the modal for load - we want to block that from happening
          if (this.userEvent === 'load') {
            const valueFromPageURL = this.idModePageFromRouter(this.router.url);
            this.modal({ showOn: 'TabletAndBelow' })
              .idMode({ page: valueFromPageURL })
              .loadHandler({ id: this.activePostId });
          }
        }
        this.onlyModeUIChanged = false;
      });

    this.postsService.postsFilters$.pipe(untilDestroyed(this)).subscribe({
      next: () => {
        // this.isLoading = true; // Also set is loading to true before filter-related operation
        // if (this.isLoading) {
        //   if (this.initialLoad) {
        //     this.initialLoad = false;
        //     return;
        //   }
        //   this.router.navigate([], {
        //     relativeTo: this.route,
        //     queryParams: {
        //       page: 1,
        //     },
        //     queryParamsHandling: 'merge',
        //   });
        //   this.posts = [];
        //   this.getPostsSubject.next({ params: this.params });
        // }
      },
    });

    /* ---------------------------------------------
      Set isLoading to false at the end of API call,
      monitored directly from posts service
    ----------------------------------------------*/
    this.postsService.isLoadingPosts$.pipe(untilDestroyed(this)).subscribe({
      next: (isLoading: boolean) => {
        // Get end of post load directly from the posts API, use it to set is loading state to false
        this.isLoading = isLoading;
        console.log('isLoading... after API loaded: ', this.isLoading);
      },
    });

    this.postsService.totalPosts$.pipe(untilDestroyed(this)).subscribe({
      next: (total) => {
        this.total = total;
      },
    });

    /* -----------------------------------------------------------------
      Centralized awaited response from API, loads after posts as needed
    ------------------------------------------------------------------*/
    this.postsService.awaitedResponse$.pipe(untilDestroyed(this)).subscribe({
      next: (response: any) => {
        const dataMetaPerPage = Number(response.meta.per_page);
        this.postCurrentLength =
          response.count < dataMetaPerPage
            ? response.meta.total
            : response.meta.current_page * response.count;

        this.loadingMorePosts = false;

        /* -------------------------------------------------------------
          Delay pagination by a "split second" to prevent slight flicker
        ---------------------------------------------------------------*/
        setTimeout(() => {
          this.paginationElementsAllowed = response.meta.total > dataMetaPerPage; // show pagination-related elements
        }, 100);

        this.activeCard().scrollToView();

        // console.log(response);
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
      //-----------------------------------
      const valueFromPageURL = this.idModePageFromRouter(this.router.url);
      this.modal({ showOn: 'TabletAndBelow' }).idMode({ page: valueFromPageURL }).resizeHandler({});
      //-----------------------------------
      this.activeCard().scrollToView();
    });

    // window.addEventListener('resize', () => {
    //   this.masonryOptions.columnWidth =
    //     this.mode === FeedMode.Tiles
    //       ? window.innerWidth > 1640
    //         ? 3
    //         : window.innerWidth <= 768
    //         ? 1
    //         : 2
    //       : 1;
    // });

    this.sessionService.isMainFiltersHidden$.pipe(untilDestroyed(this)).subscribe({
      next: (isMainFiltersHidden: boolean) => {
        setTimeout(() => {
          this.isMainFiltersOpen = !isMainFiltersHidden;
        }, 1);
      },
    });
  }
  ngOnDestroy(): void {
    this._routerEvent.unsubscribe();
  }

  ngOnInit() {
    this.getUserData();
    this.checkPermission();
    this.eventBusListeners();
  }

  private setupFeedDefaultFilters() {
    if (this.params.include_unstructured_posts) this.params['form[]']?.push('0');
    this.params.currentView = 'feed';
    (this.params.limit = 20),
      (this.params.page = 1),
      (this.pagination = {
        limit: this.params.limit,
        page: this.params.page,
      });
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
    // this.getPostsSubject.next({ params: this.params });
  }

  // private initGetPostsListener() {
  //   this.getPostsSubject.pipe(untilDestroyed(this), debounceTime(700)).subscribe({
  //     next: ({ params }) => {
  //       console.log(params);
  //       this.getPosts(params);
  //     },
  //   });
  // }

  private getPosts(params: any, loadMore?: boolean): void {
    // const isPostsAlreadyExist = !!this.posts.length;
    // if (!add) {
    //   this.posts = [];
    // }
    // if (this.mode === FeedMode.Post) {
    //   this.currentPage = 1;
    // }

    //---------------------------------
    // this.paginationElementsAllowed = this.loadingMorePosts; // this check prevents the load more button & area from temporarily disappearing (on click) [also prevents pagination element flicker in TILES mode]
    //----------------------------------
    this.postsService.getPosts('', { ...params, ...this.activeSorting }).subscribe({
      next: (data) => {
        this.posts = loadMore ? [...this.posts, ...data.results] : data.results;
        // console.log(data);
        // this.posts = add ? [...this.posts, ...data.results] : data.results;
        // conso
        // const dataMetaPerPage = Number(data.meta.per_page);
        // this.postCurrentLength =
        //   data.count < dataMetaPerPage ? data.meta.total : data.meta.current_page * data.count;
        // this.eventBusService.next({
        //   type: EventType.FeedPostsLoaded,
        //   payload: true,
        // });
        // setTimeout(() => {
        //   //---------------------------------
        //   // These are needed to achieve clean display of posts or message on the UI
        //   this.isLoading = false;
        //   this.atLeastOnePostExists = this.posts.length > 0;
        //   this.noPostsYet = !this.atLeastOnePostExists; // && this.mode === FeedMode.Tiles;
        //   this.loadingMorePosts = false; // for load more button's loader/spinner
        //   //---------------------------------
        //   this.updateMasonry();
        //   setTimeout(() => {
        //     if (this.mode === FeedMode.Post && !isPostsAlreadyExist) {
        //       document.querySelector('.post--selected')?.scrollIntoView();
        //     }
        //   }, 250);
        // }, 500);
        // setTimeout(() => {
        //   //is inside this much delayed setTimeout to prevent pagination elements flicker on load/routing
        //   this.paginationElementsAllowed = data.meta.total > dataMetaPerPage; // show pagination-related elements
        // }, 2100);
      },
      // complete: () => {
      //   // console.log('complete?');
      // },
    });
  }

  public updateMasonry(): void {
    this.masonry?.layout();
  }

  public activeCard() {
    return {
      slideOutHandler: () => {
        const postFromStorage = JSON.parse(localStorage.getItem('feedview_postObj') as string);
        this.postDetails = postFromStorage;
      },
      scrollCountHandler: ({ task }: { task: 'reset' | 'increment' }) => {
        const countPropExists = localStorage.hasOwnProperty('scroll_count');
        const localStorageCount = parseInt(localStorage.getItem('scroll_count') as string);
        const startCount = this.mode === FeedMode.Post ? 1 : 0;
        if (!countPropExists) {
          localStorage.setItem('scroll_count', `${startCount}`);
        } else {
          if (task === 'reset') localStorage.removeItem('scroll_count');
          if (task === 'increment') {
            localStorage.setItem('scroll_count', `${localStorageCount + 1}`);
          }
        }
      },
      scrollToView: () => {
        this.scrollToView = parseInt(localStorage.getItem('scroll_count') as string) === 1;
        console.log({ scrollToView: this.scrollToView });
        setTimeout(() => {
          document.querySelector('.scroll--active--postcard--to--top')?.scrollIntoView();
        }, 150);
      },
    };
  }

  public showPostDetails(post: PostResult): void {
    /* Remainder comment: 
       Naturally, the "navigateTo" function should have been directly placed here
       This is because routing is triggered by it regardless of the size of the 
       screen.
       -------------------------------
       But, we don't want to allow routing yet, if the event supplied to 
       this.modal does not match the method (see modal code and comments to 
       understand better). Therefore, the "navigateTo" function is called 
       in the modal code after the check.
       -------------------------------
       That said, If we ever decide to remove the modal totally, we can then call
       "navigateTo" directly here if we still need to route to any of the "ID Modes" 
       on card click - as shown in the comment below.
    */
    // this.navigateTo().idMode.view({ post });

    //---------------------------
    this.updateMasonry(); // never forget this guy when you need styles to adjust for masonry library
    this.onlyModeUIChanged = true;
    //---------------------------
    this.userEvent = 'click';
    this.navigateTo().idMode.view({ id: post.id });
    this.modal({ showOn: 'TabletAndBelow' }).idMode({ page: 'view' }).clickHandler({ post });
  }

  public navigateTo = () => {
    // this.updateMasonry();
    return {
      // [Remove comment later] Note: PREVIEW mode is formally called TILES mode... Still refactoring
      // eslint-disable-next-line no-empty-pattern
      previewMode: ({}) => {
        this.router.navigate(['/feed'], {
          queryParams: {
            // page: this.currentPage,
            mode: FeedMode.Tiles,
          },
          queryParamsHandling: 'merge',
        });
      },
      // [Remove comment later] Note: ID mode is formally called POST mode... Still refactoring
      idMode: {
        view: ({ id }: { id: number }) => {
          this.router.navigate(['/feed', id, 'view'], {
            // [Remove comment later]
            // relativeTo: this.route, (with this.router.navigate([id, 'view'])
            // is not great for having mode query params, if you will be able to work with it
            // you will have to discard using mode in your query params
            // Particularly because of the nature of the switchMode() code
            queryParams: {
              mode: FeedMode.Post,
            },
            queryParamsHandling: 'merge',
          });
        },
        // TODO: add edit prop later, when refactoring gets there
        edit: ({ id }: { id: number }) => {
          this.router.navigate(['/feed', id, 'edit'], {
            queryParams: {
              mode: FeedMode.Post,
            },
            queryParamsHandling: 'merge',
          });
        },
      },
    };
  };

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
      const postWord = count === 1 ? 'post' : 'posts';
      this.confirmModalService.open({
        title: this.translate.instant('notify.confirm_modal.deleted.success'),
        description: `<p>${this.translate.instant(
          'notify.confirm_modal.deleted.success_description',
          { count: `${count} ${postWord}` },
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
    // this.isLoading = true;
    this.updateMasonryLayout = !this.updateMasonryLayout;
  }

  public loadMore(): void {
    if (this.paginationElementsAllowed) {
      this.loadingMorePosts = true;
      this.activeCard().scrollCountHandler({ task: 'increment' });
      this.params.page! += 1;
      this.getPosts(this.params, true);
    }
  }

  public toggleFilters(value: boolean): void {
    if (value === this.isFiltersVisible) return;
    this.isFiltersVisible = value;
    this.sessionService.toggleFiltersVisibility(value);
  }

  // public currentFeedViewMode() {
  //   return {
  //     get: localStorage.getItem('ui_feed_mode'),
  //     set: localStorage.setItem('ui_feed_mode', this.mode),
  //   };
  // }

  public switchMode(switchButtonValue: string): void {
    // If the button is active, it shouldn't work just yet
    const modeValueBeforeRouting = this.mode;
    const inactiveSwitchModeButtonClicked = switchButtonValue !== modeValueBeforeRouting;

    if (inactiveSwitchModeButtonClicked) {
      //---------------------------
      this.updateMasonry();
      this.onlyModeUIChanged = true;
      //---------------------------
      const firstPostOnCurrentPage = this.posts[0];

      // Just navigateTo... this.activePostId check in the constructor will do the rest...
      switchButtonValue === FeedMode.Post
        ? this.navigateTo().idMode.view({ id: firstPostOnCurrentPage.id })
        : this.navigateTo().previewMode({});

      /* --------------------------------------------------------
        Update postObj in localStorage so that "Scroll to top" style is updated
        Modal will also be able to access the updated/correct post on resize
      --------------------------------------------------------------*/
      const localStorageScrollID = localStorage.getItem('feedview_post-id-to-scroll') as string;
      if (!localStorageScrollID || isNaN(parseInt(localStorageScrollID)))
        localStorage.setItem('feedview_postObj', JSON.stringify(firstPostOnCurrentPage));
    }

    // 1. If there are no posts "The switch buttons shouldn't 'try to work'"
    // Reason is because the switch buttons alongside all other elements disabled when the page is still loading, shouldn't even show up in the first place) [when there are no posts].
    // So the check is a defense for or "validation" against errors that may occur from clicking it - if the button shows up by mistake when it's not supposed to [when there are no posts].

    // 2. The switch mode button of the mode you are on should also not work if you click on it while in that mode
    // const localStorageFeedMode = this.currentFeedViewMode().get;
    // const sameSwitchButtonClicked = localStorageFeedMode === mode;
    // if (this.atLeastOnePostExists && !sameSwitchButtonClicked) {
    //   //-------------------------------------
    //   // Show loader & prevent pagination elements flicker on use of switch mode buttons
    //   this.isLoading = true;
    //   this.paginationElementsAllowed = false;
    //   //-------------------------------------
    //   this.mode = mode;
    //   if (this.collectionId) {
    //     this.switchCollectionMode();
    //     return;
    //   }
    //   if (this.mode === FeedMode.Post) {
    //     this.router.navigate(['/feed', this.posts[0].id, 'view'], {
    //       queryParams: {
    //         mode: this.mode,
    //       },
    //       queryParamsHandling: 'merge',
    //     });
    //   } else {
    //     this.router.navigate(['/feed'], {
    //       queryParams: {
    //         mode: this.mode,
    //       },
    //       queryParamsHandling: 'merge',
    //     });
    //   }
    // }
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
    this.toggleBulkOptions(false);
    this.currentPage = page;
    // TODO: Let's see how to this routing/navigation to come from the navigateTo func
    // Interesting how relativeTo works well here
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.currentPage,
      },
      queryParamsHandling: 'merge',
    });
  }

  public editPost(post: any): void {
    //---------------------------
    this.updateMasonry();
    this.onlyModeUIChanged = true;
    //---------------------------
    this.userEvent = 'click';
    this.navigateTo().idMode.edit({ id: post.id });
    this.modal({ showOn: 'TabletAndBelow' }).idMode({ page: 'edit' }).clickHandler({ post });
  }

  public modal({ showOn }: { showOn: 'TabletAndBelow' }) {
    return {
      // Note: SM_Screen means what we say is "tablet and below"
      idMode: ({ page }: { page: IdModePage }) => {
        return {
          clickHandler: ({ post }: { post: PostResult }) => {
            if (showOn === 'TabletAndBelow') {
              if (page === 'view') this.openModal({ post }).forView();
              if (page === 'edit') this.openModal({ post }).forEdit();
            }
          },
          loadHandler: ({ id }: { id: number }) => {
            if (showOn === 'TabletAndBelow') {
              this.postsService.getById(id).subscribe({
                next: (fetchedPost: PostResult) => {
                  if (page === 'view') this.openModal({ post: fetchedPost }).forView();
                  if (page === 'edit') this.openModal({ post: fetchedPost }).forEdit();
                },
                // error: (err) => {
                //   // console.log(err.status);
                //   if (err.status === 404) {
                //     this.router.navigate(['/not-found']);
                //   }
                // },
              });
            }
          },
          // To be used inside of a window resize event listener
          // eslint-disable-next-line no-empty-pattern
          resizeHandler: ({}) => {
            // Simulate card click on RESIZE
            if (showOn === 'TabletAndBelow') {
              if (this.mode === FeedMode.Post) {
                if (window.innerWidth >= 1024) {
                  this.postDetailsModal?.close();
                  // console.log(this.dialog.openDialogs);
                } else {
                  if (this.dialog.openDialogs.length) {
                    for (let i = 0; i <= this.dialog.openDialogs.length; i += 1) {
                      if (i === 0 && this.dialog.openDialogs.length === 1) {
                        const firstPostFromOpenModalDialog =
                          this.dialog.openDialogs[0].componentInstance.data.post;
                        if (page === 'view')
                          this.openModal({ post: firstPostFromOpenModalDialog }).forView();
                        if (page === 'edit')
                          this.openModal({ post: firstPostFromOpenModalDialog }).forEdit();
                        break;
                      }
                    }
                  } else {
                    const postFromStorage = JSON.parse(
                      localStorage.getItem('feedview_postObj') as string,
                    );
                    if (page === 'view') this.openModal({ post: postFromStorage }).forView();
                    if (page === 'edit') this.openModal({ post: postFromStorage }).forEdit();
                  }
                  // console.log(this.dialog.openDialogs);
                }
              }
            }
          },
        };
      },
    };
  }

  public openModal({ post }: { post: PostResult }) {
    const customModalDialog = ({
      page,
      configRemainder,
    }: {
      page: IdModePage;
      configRemainder: Record<string, any>;
    }) => {
      let config = {
        width: '100%',
        maxWidth: 576,
        height: 'auto',
        maxHeight: '90vh',
        panelClass: ['modal', 'post-modal'],
      };

      config.panelClass.push('resize-css-handler');

      config = { ...config, ...configRemainder };

      // Smaller devices only [NOTE: see CSS inside the PostDetailsModalComponent for CSS reize related fix]
      if (!this.isDesktop) {
        if (!this.dialog.openDialogs.length) {
          // !this.dialog.openDialogs.length check needed to prevent more than one modals from showing up RESIZE
          //-----------------------------------------
          this.postDetailsModal = this.dialog.open(PostDetailsModalComponent, config);
          //-----------------------------------------
          if (page === 'edit') this.postDetailsModal.componentInstance.post = post;
        }
      }

      // Regardless of device size, save post result from/on card click
      // Saving it will be useful for when we need to be able to trigger modal open/close on resize
      localStorage.setItem('feedview_postObj', JSON.stringify(post));

      // Smaller devices only - what happens after modal is closed
      // Note: [mat-dialog-close]="false" in the html of the modal takes care of closing the modal
      this.postDetailsModal?.afterClosed().subscribe((data) => {
        if (!data && !this.isDesktop) {
          // adding !isDesktop to the check prevents misbehaving and makes sure routing only takes place if current modal is closed when on smaller devices
          if (!this.dialog.openDialogs.length) {
            // !this.dialog.openDialogs.length check needed to allow routing to TILES MODE on RESIZE
            //----------------------------
            this.onlyModeUIChanged = true;
            //----------------------------
            this.router.navigate(['/feed'], {
              queryParams: {
                mode: FeedMode.Tiles,
              },
              queryParamsHandling: 'merge',
            });
          }
        }
      });
    };

    return {
      forView: () => {
        const configRemainder = {
          data: { post: post, color: post.color, twitterId: post.data_source_message_id },
        };
        customModalDialog({ page: 'view', configRemainder });
      },
      forEdit: () => {
        const configRemainder = {
          data: {
            editable: true,
            color: post.color,
            twitterId: post.data_source_message_id,
          },
        };
        customModalDialog({ page: 'edit', configRemainder });
      },
    };
  }

  private showMessage(message: string, type: string, duration = 3000) {
    this.snackBar.open(message, 'Close', {
      panelClass: [type],
      duration,
    });
  }
}
