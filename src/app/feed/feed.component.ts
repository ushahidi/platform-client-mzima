import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { searchFormHelper } from '@helpers';
import { GeoJsonFilter, PostResult } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
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
import { MainViewComponent } from '@shared';

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
  postsFilters$ = this.postsService.postsFilters$.pipe(untilDestroyed(this));
  private isDesktop$ = this.breakpointService.isDesktop$.pipe(untilDestroyed(this));
  public override params: GeoJsonFilter = {
    limit: 9,
    offset: 0,
    created_before_by_id: '',
  };
  public pagination = {
    page: 1,
    size: this.params.limit,
  };
  public posts: any[] = [];
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
  FeedMode = FeedMode;
  public currentPage = 1;
  public itemsPerPage = 9;
  public activePastId: string;
  private postDetailsModal: MatDialogRef<PostDetailsModalComponent>;
  public isMainFiltersOpen: boolean;

  constructor(
    protected override router: Router,
    protected override route: ActivatedRoute,
    protected override postsService: PostsService,
    protected override savedSearchesService: SavedsearchesService,
    protected override eventBusService: EventBusService,
    protected override sessionService: SessionService,
    private postsV5Service: PostsV5Service,
    private confirmModalService: ConfirmModalService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private breakpointService: BreakpointService,
    private languageService: LanguageService,
  ) {
    super(router, route, postsService, savedSearchesService, eventBusService, sessionService);
    this.isDesktop$.subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
        if (!this.isDesktop) {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
              mode: FeedMode.Tiles,
            },
            queryParamsHandling: 'merge',
          });

          if (this.activePastId) {
            this.showPostModal(this.activePastId);
          }
        } else {
          this.postDetailsModal?.close();
        }
      },
    });

    this.route.firstChild?.params.subscribe((params) => {
      this.activePastId = params['id'];
      if (this.activePastId && !this.isDesktop) {
        this.showPostModal(this.activePastId);
      }
    });

    this.route.params.subscribe(() => {
      this.initCollection();
    });

    this.route.queryParams.subscribe({
      next: (params: Params) => {
        this.currentPage = params['page'] ? Number(params['page']) : 1;
        this.mode = params['mode'] && this.isDesktop ? params['mode'] : FeedMode.Tiles;

        this.postsFilters$.subscribe({
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

    this.sessionService.isFiltersVisible$.subscribe({
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
        this.mode === FeedMode.Tiles
          ? window.innerWidth > 1640
            ? 3
            : window.innerWidth <= 768
            ? 1
            : 2
          : 1;
    });

    this.sessionService.isMainFiltersHidden$.subscribe({
      next: (isMainFiltersHidden: boolean) => {
        setTimeout(() => {
          this.isMainFiltersOpen = !isMainFiltersHidden;
        }, 1);
      },
    });
  }

  ngOnInit() {
    this.getUserData();

    this.eventBusService.on(EventType.DeleteCollection).subscribe({
      next: (colId) => {
        if (Number(colId) === Number(this.collectionId)) {
          this.router.navigate(['/feed']);
        }
      },
    });
  }

  private getPosts(params: any, add?: boolean): void {
    if (!add) {
      this.posts = [];
    }
    this.isLoading = true;
    this.postsService.getPosts('', { ...params, ...this.activeSorting }).subscribe({
      next: (data) => {
        this.posts = add ? [...this.posts, ...data.results] : data.results;
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
    this.params.offset = (this.pagination.size || 0) * (this.pagination.page - 1);
    this.getPosts(this.params);
  }

  public showPostDetails(post: any): void {
    if (this.isDesktop) {
      this.router.navigate(['feed', post.id, 'view'], {
        queryParams: {
          mode: FeedMode.Post,
        },
        queryParamsHandling: 'merge',
      });
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
          this.getPosts(this.params);
        }
      });

      this.postsV5Service.getById(post.id).subscribe({
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

    const count = this.selectedPosts.length;
    forkJoin(this.selectedPosts.map((p) => this.postsService.delete(p))).subscribe({
      complete: () => {
        this.getPosts(this.params);
        this.selectedPosts = [];
        this.confirmModalService.open({
          title: this.translate.instant('notify.confirm_modal.deleted.success'),
          description: `<p>${this.translate.instant(
            'notify.confirm_modal.deleted.success_description',
            { count },
          )}</p>`,
          buttonSuccess: this.translate.instant('notify.confirm_modal.deleted.success_button'),
        });
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
    this.sessionService.toggleFiltersVisibility(value);
  }

  public switchMode(mode: FeedMode): void {
    this.mode = mode;
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

    this.postsV5Service.getById(post.id).subscribe({
      next: (postV5: PostResult) => {
        this.postDetailsModal.componentInstance.post = postV5;
      },
    });

    this.postDetailsModal.afterClosed().subscribe((data) => {
      if (data?.update) {
        this.getPosts(this.params);
      }
    });
  }
}
