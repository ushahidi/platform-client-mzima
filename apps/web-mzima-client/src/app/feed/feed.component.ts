import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
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
  Preview = 'PREVIEW',
  Id = 'ID',
}

type UserEvent = 'load' | 'click' | 'resize';
type IdModePage = 'view' | 'edit' | 'not-found' | 'not-allowed';

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
  public idModePages: ['view', 'edit', 'not-found', 'not-allowed'] = [
    'view',
    'edit',
    'not-found',
    'not-allowed',
  ];
  public idModePageFromRouter = (routerUrl: string) =>
    this.idModePages.filter((string) => routerUrl.includes(`/${string}`))[0] as IdModePage; // will help app keep track of id mode page for use later on resize, after setting on page load
  public onlyModeUIChanged = false;
  public postsSkeleton = new Array(20).fill(''); // used for Id mode's skeleton loader
  public posts: PostResult[] = [];
  public postCurrentLength = 0;
  public isLoading: boolean;
  public atLeastOnePostExists: boolean;
  public noPostsYet: boolean = false;
  public loadingMorePosts: boolean;
  public paginationElementsAllowed: boolean = false;
  public mode: FeedMode = FeedMode.Preview;
  public activePostId: number;
  public total: number;
  public postDetails?: PostResult;
  public scrollToView: boolean;
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
  public urlFromRouteTrigger: string;
  public urlAfterInteractionWithFilters: string;

  constructor(
    protected override router: Router,
    protected override route: ActivatedRoute,
    protected override postsService: PostsService,
    protected override savedSearchesService: SavedsearchesService,
    protected override eventBusService: EventBusService,
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private location: Location,
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
    this.setupFeedDefaultFilters();

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
        this.mode = postModeHint ? FeedMode.Id : FeedMode.Preview;
        //----------------------------------------------

        this.activeCard.scrollCountHandler({ task: 'reset' });

        this.isLoading = !this.onlyModeUIChanged;
        this.paginationElementsAllowed = this.onlyModeUIChanged
          ? this.posts.length >= 20 || this.currentPage > 1
          : !this.posts;

        this.currentPage = params['page'] ? Number(params['page']) : 1;
        this.params.page = this.currentPage;

        //-----------------------------------
        this.savePageURL.onRouterTriggered({ url: this.router.url });
        //-----------------------------------

        /* ---------------------------------------------------
          Change mode params in browser URL if user tries some
          other options apart from the mode options we provide,
          and without causing page reload or double posts load
        -----------------------------------------------------*/
        if (params['mode'] && params['mode'] !== this.mode) {
          const pageURL = this.router
            .createUrlTree([], {
              relativeTo: this.route,
              queryParams: { ...params, mode: this.mode },
            })
            .toString();
          //-----------------------------------
          this.savePageURL.onRouterTriggered({ url: pageURL });
          //-----------------------------------
          this.location.go(pageURL);
        }

        /* -------------------------------------------------------------------
          i.e will NOT empty posts for Post Card and SwitchMode button clicks
        ---------------------------------------------------------------------*/
        if (this.isLoading) {
          this.posts = [];
          this.getPosts({ params: this.params });
        }

        /* -------------------------------------------------------------------
          On using the "switch mode" button to navigate to PREVIEW MODE:
          this restores PREVIEW MODE posts to what it was before,
          if the "load more" button has been used to add more posts in the ID MODE
        ------------------------------------------------------------------- */
        if (this.mode === FeedMode.Preview && this.onlyModeUIChanged && this.posts.length > 20) {
          this.posts = this.posts.slice(0, 20);
          this.postCurrentLength = this.posts.length * this.currentPage;
        }
      },
    });

    this._routerEvent = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((/*event*/) => {
        /* ----------------------------------------------
          Reset saved filters URL for when page loads (or 
          page buttons that also) trigger router.navigate
        -----------------------------------------------*/
        this.urlAfterInteractionWithFilters = '';
        //-----------------------------------

        this.activeCard.scrollCountHandler({ task: 'increment' });

        this.masonryUpdateOnModeSwitch({ userEvent: this.userEvent });

        this.activeCard.slideOutHandler();
        this.activeCard.scrollToView();

        if (this.mode === FeedMode.Preview) {
          //----------------------------------
          localStorage.removeItem('feedview_postObj');
          //----------------------------------
        }
        if (this.mode === FeedMode.Id) {
          // Note: Without this event check, clicking on card will also trigger the modal for load - we want to block that from happening
          if (this.userEvent === 'load') {
            //----------------------------------
            localStorage.setItem('feedview_postObj', JSON.stringify({}));
            //----------------------------------
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
        this.isLoading = true; // Also set is loading to true before filter-related operation
        this.paginationElementsAllowed = false;
        if (this.isLoading) {
          if (this.initialLoad) {
            this.initialLoad = false;
            return;
          }

          const currentPageBeforeInteractingWithFilters = this.currentPage; // set this before the value of this.currentPage is changed
          //-----------------------------------
          this.currentPage = 1; // Very important! - set current page to 1 every time we are accessing filters (and also use it to access posts once filters or clear filters is triggered)
          //-----------------------------------
          this.urlAfterInteractionWithFilters = this.setPageURLonInteractionWithFilters({
            routerURL: this.urlFromRouteTrigger,
            currentPageBeforeInteractingWithFilters,
          });
          //-----------------------------------
          this.savePageURL.onInteractionWithFilters({ url: this.urlAfterInteractionWithFilters });
          //-----------------------------------
          this.location.go(this.urlAfterInteractionWithFilters);
          //-----------------------------------

          this.posts = [];
          const params = { ...this.params, page: this.currentPage };
          this.getPosts({ params });
        }
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

        this.navigateToFirstPostOnPageOneWhenFilteringInIdMode();

        /* -------------------------------------------------------------
          Delay pagination by a "split second" to prevent slight flicker
        ---------------------------------------------------------------*/
        setTimeout(() => {
          this.paginationElementsAllowed = response.meta.total > dataMetaPerPage; // show pagination-related elements
          this.loadingMorePosts = false;
        }, 1200);

        this.activeCard.scrollToView();
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
      this.activeCard.scrollCountHandler({ task: 'startCount' });
      this.masonryUpdateOnModeSwitch({ userEvent: 'resize' });
      //-----------------------------------
      const valueFromPageURL = this.idModePageFromRouter(this.router.url);
      this.modal({ showOn: 'TabletAndBelow' }).idMode({ page: valueFromPageURL }).resizeHandler({});
      //-----------------------------------
      this.activeCard.scrollToView();
    });

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

  loadData(): void {}

  private getPosts({ params, loadMore }: { params: any; loadMore?: boolean }): void {
    /* --------------------------------------------
      Work with Posts Service to get posts from API
    ----------------------------------------------*/
    this.postsService.getPosts('', { ...params, ...this.activeSorting }).subscribe({
      next: (data) => {
        this.posts = loadMore ? [...this.posts, ...data.results] : data.results;
      },
      // complete: () => {
      //   // console.log('complete?');
      // },
    });
  }

  public updateMasonry(): void {
    this.masonry?.layout();
  }

  public masonryUpdateOnModeSwitch({ userEvent }: { userEvent: UserEvent }): void {
    /* -----------------------------------------------
        Smooth transition of masonry layout from PREVIEW
        mode to ID mode and vice versa
      ------------------------------------------------*/
    const idModeScrollCount =
      userEvent === 'resize' ? 0 : parseInt(localStorage.getItem('scroll_count') as string) === 1;
    const postVisibility = (post: Element, value: string) => {
      (post as HTMLElement).style.setProperty('visibility', value);
    };
    document.querySelectorAll('.post').forEach((post) => {
      if (idModeScrollCount && window.innerWidth >= 1024) {
        postVisibility(post, 'hidden');
        setTimeout(() => {
          postVisibility(post, 'visible');
        }, 70);
      } else {
        postVisibility(post, '');
      }
    });

    /* -------------------------------------------
        Never (ever) forget this "guy" when you need 
        styles to adjust for masonry library
      --------------------------------------------*/
    this.updateMasonry();
  }

  public activeCard = {
    slideOutHandler: () => {
      const postFromStorage = JSON.parse(localStorage.getItem('feedview_postObj') as string);
      this.postDetails = postFromStorage;
    },
    scrollCountHandler: ({ task }: { task: 'reset' | 'increment' | 'startCount' }) => {
      const countPropExists = localStorage.hasOwnProperty('scroll_count');
      const localStorageCount = parseInt(localStorage.getItem('scroll_count') as string);
      const startCount = this.mode === FeedMode.Id ? 1 : 0;
      if (!countPropExists) {
        localStorage.setItem('scroll_count', `${startCount}`);
      } else {
        if (task === 'reset') localStorage.removeItem('scroll_count');
        if (task === 'increment') localStorage.setItem('scroll_count', `${localStorageCount + 1}`);
        if (task === 'startCount') localStorage.setItem('scroll_count', `${startCount}`);
      }
    },
    scrollToView: () => {
      this.scrollToView = parseInt(localStorage.getItem('scroll_count') as string) === 1;
      setTimeout(() => {
        document.querySelector('.scroll--active--postcard--to--top')?.scrollIntoView();
      }, 150);
    },
  };

  public showPostDetails(post: PostResult): void {
    //---------------------------
    this.onlyModeUIChanged = true;
    //---------------------------
    this.userEvent = 'click';
    this.navigateTo().idMode.view({ id: post.id });
    this.modal({ showOn: 'TabletAndBelow' }).idMode({ page: 'view' }).clickHandler({ post });
  }

  public navigateTo = () => {
    const feed: string = '/feed';
    const collection: string = 'collection';

    const usePageUrl = () => {
      return {
        // eslint-disable-next-line no-empty-pattern
        previewMode: ({}) => {
          return this.collectionId ? [feed, collection, this.collectionId] : [feed];
        },
        idMode: ({ id, page }: { id: number; page: string }) => {
          const idModeUrl = this.collectionId
            ? [feed, collection, this.collectionId, id, page]
            : [feed, id, page];
          return idModeUrl;
        },
      };
    };

    const useQueryParams = ({ queryParams }: { queryParams: any }) => {
      const currentPageForFilters = 1;
      const userHasInteractedWithFilters =
        this.urlAfterInteractionWithFilters &&
        this.urlAfterInteractionWithFilters.includes(`page=${currentPageForFilters}`);
      queryParams = userHasInteractedWithFilters
        ? { page: currentPageForFilters, ...queryParams }
        : queryParams;
      return queryParams;
    };

    return {
      // eslint-disable-next-line no-empty-pattern
      previewMode: ({}) => {
        //---------------------------------
        const pageURL = usePageUrl().previewMode({});
        //---------------------------------
        const queryParams = useQueryParams({
          queryParams: { mode: FeedMode.Preview },
        });

        this.router.navigate(pageURL, {
          queryParams,
          queryParamsHandling: 'merge',
        });
      },
      idMode: {
        view: ({ id }: { id: number }) => {
          //---------------------------------
          const pageURL = usePageUrl().idMode({ id, page: 'view' });
          //---------------------------------
          const queryParams = useQueryParams({
            queryParams: { mode: FeedMode.Id },
          });

          this.router.navigate(pageURL, {
            queryParams,
            queryParamsHandling: 'merge',
          });
        },
        edit: ({ id }: { id: number }) => {
          //---------------------------------
          const pageURL = usePageUrl().idMode({ id, page: 'edit' });
          //---------------------------------
          const queryParams = useQueryParams({
            queryParams: { mode: FeedMode.Id },
          });

          this.router.navigate(pageURL, {
            queryParams,
            queryParamsHandling: 'merge',
          });
        },
        /* ------------------------------------------------
          The '/not-found' and '/not-allowed' page of the
          idMode is also done at router level, but through
          the RedirectByPostIdGuard
          -------------------------------------------------
          We only added routing for them here for when we
          need to trigger them with the modal.
        -------------------------------------------------*/
        postNotFound: ({ id }: { id: number }) => {
          //---------------------------------
          const pageURL = usePageUrl().idMode({ id, page: 'not-found' });
          //---------------------------------
          this.router.navigate(pageURL, {
            queryParams: {
              mode: FeedMode.Id,
            },
            queryParamsHandling: 'merge',
          });
        },
        PostNotAllowed: ({ id }: { id: number }) => {
          //---------------------------------
          const pageURL = usePageUrl().idMode({ id, page: 'not-allowed' });
          //---------------------------------
          this.router.navigate(pageURL, {
            queryParams: {
              mode: FeedMode.Id,
            },
            queryParamsHandling: 'merge',
          });
        },
      },
      // eslint-disable-next-line no-empty-pattern
      pathFromCurrentRoute: ({ page }: { page: any }) => {
        // Interesting how relativeTo works well here
        //------------------------
        this.currentPage = page;
        //------------------------
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {
            page: this.currentPage,
          },
          queryParamsHandling: 'merge',
        });
      },
    };
  };

  public savePageURL = {
    onRouterTriggered: ({ url }: { url: string }) => {
      this.urlFromRouteTrigger = url;
    },
    onInteractionWithFilters: ({ url }: { url: string }) => {
      this.urlAfterInteractionWithFilters = url;
    },
  };

  public setPageURLonInteractionWithFilters = ({
    routerURL,
    currentPageBeforeInteractingWithFilters,
  }: {
    routerURL: string;
    currentPageBeforeInteractingWithFilters: number;
  }) => {
    if (routerURL.includes(`page=${currentPageBeforeInteractingWithFilters}`)) {
      routerURL = routerURL.replace(
        `page=${currentPageBeforeInteractingWithFilters}`,
        `page=${this.currentPage}`,
      );
    } else {
      const urlHasModeID = routerURL.includes(`mode=${FeedMode.Id}`);
      const urlHasModePREVIEW = routerURL.includes(`mode=${FeedMode.Preview}`);

      let params: Record<string, any> = {};
      if (urlHasModeID || urlHasModePREVIEW) params = { mode: this.mode };

      routerURL = this.router
        .createUrlTree([], {
          relativeTo: this.route,
          queryParams: { ...params, page: this.currentPage },
        })
        .toString();
    }
    return routerURL;
  };

  public navigateToFirstPostOnPageOneWhenFilteringInIdMode = () => {
    const userHasInteractedWithFilters =
      this.urlAfterInteractionWithFilters && this.urlAfterInteractionWithFilters !== '';
    if (userHasInteractedWithFilters) {
      /* -----------------------------------------------------------------------
        Similar to what we did in switch mode - use first post from API response
      ------------------------------------------------------------------------*/
      const firstPostOnCurrentPage = this.posts[0];
      const valueFromPageURL = this.idModePageFromRouter(this.urlAfterInteractionWithFilters);
      if (this.mode === FeedMode.Id) {
        const idEndInURL = this.urlAfterInteractionWithFilters.indexOf(valueFromPageURL);
        const firstPartOfURL = this.urlAfterInteractionWithFilters.slice(0, idEndInURL - 1);
        const idInURL = firstPartOfURL.slice(
          firstPartOfURL.lastIndexOf('/') + 1,
          firstPartOfURL.length,
        );

        let pageURL = this.urlAfterInteractionWithFilters.replace(
          `/${idInURL}/`,
          `/${firstPostOnCurrentPage.id}/`,
        );

        const view = 'view';
        if (valueFromPageURL !== view) pageURL = pageURL.replace(valueFromPageURL, view);

        this.router.navigateByUrl(pageURL); // using navigateByUrl as location.go() does not change post details

        this.modal({ showOn: 'TabletAndBelow' })
          .idMode({ page: 'view' })
          .clickHandler({ post: firstPostOnCurrentPage });
      }
    }
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
        this.getPosts({ params: this.params });
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
    this.getPosts({ params: this.params });
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
  public isLocked(post: PostResult) {
    return this.postsService.isPostLockedForCurrentUser(post);
  }
  public postStatusChanged(): void {
    this.getPosts({ params: this.params });
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
    this.getPosts({ params: this.params });
  }

  public loadMore(): void {
    if (this.paginationElementsAllowed) {
      this.loadingMorePosts = true;
      this.activeCard.scrollCountHandler({ task: 'increment' });
      this.params.page! += 1;
      this.getPosts({ params: this.params, loadMore: true });
    }
  }

  public toggleFilters(value: boolean): void {
    if (value === this.isFiltersVisible) return;
    this.isFiltersVisible = value;
    this.sessionService.toggleFiltersVisibility(value);
  }

  public switchMode(switchButtonValue: string): void {
    /* --------------------------------------------------
      If the button is active, it shouldn't work just yet
    ----------------------------------------------------*/
    const modeValueBeforeRouting = this.mode;
    const inactiveSwitchModeButtonClicked = switchButtonValue !== modeValueBeforeRouting;

    if (inactiveSwitchModeButtonClicked) {
      //---------------------------
      this.onlyModeUIChanged = true;
      //---------------------------
      const firstPostOnCurrentPage = this.posts[0];

      /* --------------------------------------------------------------------------------
        Just navigateTo... this.activePostId check in the constructor will do the rest...
      ----------------------------------------------------------------------------------*/
      switchButtonValue === FeedMode.Id
        ? this.navigateTo().idMode.view({ id: firstPostOnCurrentPage.id })
        : this.navigateTo().previewMode({});

      /* ------------------------------------------------------------------------------------
        Larger devices: Updates postObj in localStorage so that "Scroll to top" style
        Smaller devices: Modal will also be able to access the updated/correct post on resize
      -------------------------------------------------------------------------------------*/
      if (switchButtonValue === FeedMode.Id) {
        this.modal({ showOn: 'TabletAndBelow' })
          .idMode({ page: 'view' })
          .clickHandler({ post: firstPostOnCurrentPage });
      }
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
    this.navigateTo().pathFromCurrentRoute({ page });
  }

  public editPost(post: any): void {
    //---------------------------
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
                  if (page === 'edit') {
                    if (fetchedPost.allowed_privileges.includes('update')) {
                      this.openModal({ post: fetchedPost }).forEdit();
                    } else {
                      this.navigateTo().idMode.PostNotAllowed({ id: fetchedPost.id });
                    }
                  }
                  if (page === 'not-allowed') {
                    this.openModal({ post: {} }).forPostNotFoundOrNotAllowed({ page });
                  }
                },
                error: (err) => {
                  if (err.status === 404) {
                    if (page === 'not-found') {
                      this.navigateTo().idMode.postNotFound({ id });
                      this.openModal({ post: {} }).forPostNotFoundOrNotAllowed({ page });
                    }
                  }
                },
              });
            }
          },
          // To be used inside of a window resize event listener
          // eslint-disable-next-line no-empty-pattern
          resizeHandler: ({}) => {
            // Simulate card click on RESIZE
            if (showOn === 'TabletAndBelow') {
              if (this.mode === FeedMode.Id) {
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
                        if (page === 'not-found' || page === 'not-allowed')
                          this.openModal({ post: {} }).forPostNotFoundOrNotAllowed({ page });
                        break;
                      }
                    }
                  } else {
                    const postFromStorage = JSON.parse(
                      localStorage.getItem('feedview_postObj') as string,
                    );
                    if (page === 'view') this.openModal({ post: postFromStorage }).forView();
                    if (page === 'edit') this.openModal({ post: postFromStorage }).forEdit();
                    if (page === 'not-found' || page === 'not-allowed')
                      this.openModal({ post: postFromStorage }).forPostNotFoundOrNotAllowed({
                        page,
                      });
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

  public openModal({ post }: { post: PostResult | Record<string, any> }) {
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
          if (page === 'not-found' || page === 'not-allowed')
            this.postDetailsModal.componentInstance.post = configRemainder;
        }
      }

      // Regardless of device size, save post result from/on card click
      // Saving it will be useful for when we need to be able to trigger modal open/close on resize
      post = page === 'view' || page === 'edit' ? post : {};
      localStorage.setItem('feedview_postObj', JSON.stringify(post));

      // Smaller devices only - what happens after modal is closed
      // Note: [mat-dialog-close]="false" in the html of the modal takes care of closing the modal
      this.postDetailsModal?.afterClosed().subscribe((data) => {
        if (!data && !this.isDesktop) {
          // adding !isDesktop to the check prevents misbehaving and makes sure routing only takes place if current modal is closed when on smaller devices
          if (!this.dialog.openDialogs.length) {
            // !this.dialog.openDialogs.length check needed to allow routing to PREVIEW MODE on RESIZE
            //----------------------------
            this.onlyModeUIChanged = true;
            //----------------------------
            this.navigateTo().previewMode({});
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
      forPostNotFoundOrNotAllowed: ({ page }: { page: IdModePage }) => {
        const configRemainder = { data: { urlEnd: page } };
        customModalDialog({ page, configRemainder });
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
