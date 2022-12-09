import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params } from '@angular/router';
import { searchFormHelper } from '@helpers';
import { GeoJsonFilter, PostResult } from '@models';
import { ConfirmModalService, PostsService, PostsV5Service, SessionService } from '@services';
import { NgxMasonryComponent } from 'ngx-masonry';
import { forkJoin } from 'rxjs';
import { PostDetailsModalComponent } from '../map';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent {
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
  public posts: any[] = [];
  public isLoading = false;
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

  constructor(
    private postsService: PostsService,
    private route: ActivatedRoute,
    private postsV5Service: PostsV5Service,
    private session: SessionService,
    private confirmModalService: ConfirmModalService,
    private dialog: MatDialog,
  ) {
    this.route.params.subscribe(() => {
      this.initCollection();
    });

    this.route.queryParams.subscribe({
      next: (params: Params) => {
        const id: string = params['id'] || '';
        this.params.created_before_by_id = id;
        id?.length ? this.getPost(id) : (this.postDetails = undefined);

        this.postsService.postsFilters$.subscribe({
          next: () => {
            this.posts = [];
            this.params.offset = 0;
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
  }

  initCollection() {
    if (this.route.snapshot.data['view'] === 'collection') {
      this.collectionId = this.route.snapshot.paramMap.get('id')!;
      this.params.set = this.collectionId;
      this.postsService.applyFilters({ set: this.collectionId });
    } else {
      this.collectionId = '';
      this.params.set = '';
      this.postsService.applyFilters({ set: [] });
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
          if (this.feed?.nativeElement.offsetHeight >= this.feed?.nativeElement.scrollHeight) {
            this.loadMore();
          }
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
    const postDetailsModal = this.dialog.open(PostDetailsModalComponent, {
      width: '100%',
      maxWidth: 576,
      data: { color: post.color, twitterId: post.data_source_message_id },
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'post-modal',
    });

    this.postsV5Service.getById(post.id).subscribe({
      next: (postV5: PostResult) => {
        postDetailsModal.componentInstance.post = postV5;
      },
    });
  }

  public toggleBulkOptions(state: boolean): void {
    this.isBulkOptionsVisible = state;
    if (!this.isBulkOptionsVisible) {
      this.deselectAllPosts();
    }
  }

  public changePostsStatus(event: any): void {
    forkJoin(
      this.selectedPosts.map((p) => this.postsService.update(p, { status: event.value })),
    ).subscribe({
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
      title: `Are you sure you want to Delete (${this.selectedPosts.length}) posts?`,
      description:
        'Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Remember, you won’t be able to undo this action. ',
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

  public onScroll(event: any): void {
    if (
      !this.isLoading &&
      event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight - 32
    ) {
      this.loadMore();
    }
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
}
