import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { searchFormHelper } from '@helpers';
import { GeoJsonFilter, PostResult, UserInterface } from '@models';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import {
  ConfirmModalService,
  EventBusService,
  EventType,
  PostsService,
  PostsV5Service,
  SavedsearchesService,
  SessionService,
  BreakpointService,
  LanguageService,
} from '@services';
import { NgxMasonryComponent, NgxMasonryOptions } from 'ngx-masonry';
import { forkJoin } from 'rxjs';
import { PostDetailsModalComponent } from '../map';

enum FeedModeEnum {
  Tiles = 'TILES',
  Post = 'POST',
}

@UntilDestroy()
@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent implements OnInit {
  @ViewChild('feed') public feed: ElementRef;
  @ViewChild('masonry') public masonry: NgxMasonryComponent;
  public params: GeoJsonFilter = {
    limit: 9,
    offset: 0,
    created_before_by_id: '',
  };
  public pagination = {
    page: 1,
    size: this.params.limit,
  };
  collectionId = '';
  searchId = '';
  public posts: any[] = [];
  public isLoading = false;
  public mode: FeedModeEnum = FeedModeEnum.Tiles;
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
  // TODO: Fix takeUntilDestroy$() with material components
  // private userData$ = this.session.currentUserData$.pipe(takeUntilDestroy$());
  private userData$ = this.session.currentUserData$.pipe(untilDestroyed(this));
  public user: UserInterface;
  private filters = JSON.parse(
    localStorage.getItem(this.session.localStorageNameMapper('filters'))!,
  );
  public isDesktop = false;
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
  public get FeedModeEnum(): typeof FeedModeEnum {
    return FeedModeEnum;
  }
  public currentPage = 1;
  public itemsPerPage = 9;

  constructor(
    private postsService: PostsService,
    private route: ActivatedRoute,
    private postsV5Service: PostsV5Service,
    private session: SessionService,
    private confirmModalService: ConfirmModalService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private savedSearchesService: SavedsearchesService,
    private eventBusService: EventBusService,
    private breakpointService: BreakpointService,
    private languageService: LanguageService,
    private router: Router,
  ) {
    this.breakpointService.isDesktop.subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
        if (!this.isDesktop) {
          this.router.navigate(['/feed'], {
            queryParams: {
              mode: FeedModeEnum.Tiles,
            },
            queryParamsHandling: 'merge',
          });
        }
      },
    });

    this.route.params.subscribe(() => {
      this.initCollection();
    });

    this.route.queryParams.subscribe({
      next: (params: Params) => {
        const id: string = params['id'] || '';
        this.params.created_before_by_id = id;
        id?.length ? this.getPost(id) : (this.postDetails = undefined);
        this.currentPage = params['page'] ? Number(params['page']) : 1;
        this.mode = params['mode'] ? params['mode'] : FeedModeEnum.Tiles;

        this.postsService.postsFilters$.subscribe({
          next: () => {
            this.posts = [];
            this.params.offset = (this.currentPage - 1) * (this.params.limit ?? 0);
            this.getPosts(this.params);
          },
        });
      },
    });

    this.postsService.totalPosts$.subscribe({
      next: (total) => {
        this.total = total;
      },
    });

    this.session.isFiltersVisible$.subscribe({
      next: (isFiltersVisible) => {
        setTimeout(() => {
          this.isFiltersVisible = isFiltersVisible;
        }, 1);
      },
    });

    this.languageService.isRTL$.subscribe({
      next: (isRTL) => {
        if (this.isRTL !== isRTL) {
          this.isRTL = isRTL;
          this.masonryOptions.originLeft = !this.isRTL;
        }
      },
    });

    window.addEventListener('resize', () => {
      this.masonryOptions.columnWidth =
        this.mode === FeedModeEnum.Tiles
          ? window.innerWidth > 1366
            ? 3
            : window.innerWidth <= 768
            ? 1
            : 2
          : 1;
    });
  }

  ngOnInit() {
    this.getUserData();
  }

  private getUserData(): void {
    this.userData$.subscribe({
      next: (userData) => (this.user = userData),
    });
  }

  initCollection() {
    if (this.route.snapshot.data['view'] === 'collection') {
      this.collectionId = this.route.snapshot.paramMap.get('id')!;
      this.params.set = this.collectionId;
      this.postsService.applyFilters({ set: this.collectionId, ...this.filters });
      this.searchId = '';
    } else {
      this.collectionId = '';
      this.params.set = '';
      if (this.route.snapshot.data['view'] === 'search') {
        this.searchId = this.route.snapshot.paramMap.get('id')!;
        this.savedSearchesService.getById(this.searchId).subscribe((sSearch) => {
          this.postsService.applyFilters(Object.assign(sSearch.filter, { set: [] }));
          this.eventBusService.next({
            type: EventType.SavedSearchInit,
            payload: this.searchId,
          });
        });
      } else {
        this.searchId = '';
        this.postsService.applyFilters({ set: [], ...this.filters });
      }
    }
  }

  private getPosts(params: any, add?: boolean): void {
    if (!add) {
      this.posts = [];
    }
    this.isLoading = true;
    this.postsService.getPosts('', { ...params, ...this.activeSorting }).subscribe({
      next: (data) => {
        this.posts = add ? [...this.posts, ...data.results] : data.results;
        setTimeout(() => {
          this.isLoading = false;
          this.masonry?.layout();
        }, 500);
      },
    });
  }

  private getPost(postId: string): void {
    this.postDetails = undefined;
    this.isPostLoading = true;
    this.postsV5Service.getById(postId).subscribe({
      next: (post: PostResult) => {
        this.postDetails = post;
      },
      complete: () => {
        this.isPostLoading = false;
      },
    });
  }

  public pageChanged(page: any): void {
    this.pagination.page = page;
    this.params.offset = (this.pagination.size || 0) * (this.pagination.page - 1);
    this.getPosts(this.params);
  }

  public showPostDetails(post: any): void {
    if (this.isDesktop) {
      this.router.navigate(['/feed/post', post.id], {
        queryParams: {
          mode: FeedModeEnum.Post,
        },
        queryParamsHandling: 'merge',
      });
    } else {
      const postDetailsModal = this.dialog.open(PostDetailsModalComponent, {
        width: '100%',
        maxWidth: 576,
        data: { color: post.color, twitterId: post.data_source_message_id },
        height: 'auto',
        maxHeight: '90vh',
        panelClass: ['modal', 'post-modal'],
      });

      this.postsV5Service.getById(post.id).subscribe({
        next: (postV5: PostResult) => {
          postDetailsModal.componentInstance.post = postV5;
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
        this.getPosts(this.params);
        this.selectedStatus = undefined;
        this.deselectAllPosts();
      },
    });
  }

  public selectAllPosts(): void {
    this.posts.map((post) => {
      if (this.selectedPosts.find((selectedPost) => selectedPost === post.id)) return;
      this.selectedPosts.push(post.id);
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

    forkJoin(this.selectedPosts.map((p) => this.postsService.delete(p))).subscribe({
      complete: () => {
        this.getPosts(this.params);
        this.selectedPosts = [];
      },
    });
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
    this.getPosts(this.params);
  }

  public refreshMasonry(): void {
    this.updateMasonryLayout = !this.updateMasonryLayout;
  }

  // public onScroll(event: any): void {
  //   if (
  //     !this.isLoading &&
  //     ((this.isDesktop &&
  //       event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight - 32) ||
  //       (!this.isDesktop &&
  //         event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight))
  //   ) {
  //     this.loadMore();
  //   }
  // }

  public loadMore(): void {
    if (
      this.params.offset !== undefined &&
      this.params.limit !== undefined &&
      this.params.offset + this.params.limit < this.total
    ) {
      this.params.offset = this.params.offset + this.params.limit;
      this.getPosts(this.params, true);
    }
  }

  public toggleFilters(value: boolean): void {
    if (value === this.isFiltersVisible) return;
    this.isFiltersVisible = value;
    this.session.toggleFiltersVisibility(value);
  }

  public switchMode(mode: FeedModeEnum): void {
    this.mode = mode;
    if (this.mode === FeedModeEnum.Post) {
      this.router.navigate(['/feed', this.posts[0].id], {
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
}
