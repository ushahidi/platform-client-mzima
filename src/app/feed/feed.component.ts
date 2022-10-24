import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { takeUntilDestroy$ } from '@helpers';
import { GeoJsonFilter, PostResult } from '@models';
import { PostsService, PostsV5Service, SessionService } from '@services';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent {
  private params: GeoJsonFilter = {
    limit: 10,
    offset: 0,
    created_before_by_id: '',
  };
  public posts?: PostResult[];
  public isLoading = false;
  public activePostId: any;
  public total: number;
  public postDetails?: PostResult;
  public isPostLoading: boolean;
  userData$ = this.sessionService.currentUserData$.pipe(takeUntilDestroy$());
  userId: string | number;

  constructor(
    private postsService: PostsService,
    private route: ActivatedRoute,
    private postsV5Service: PostsV5Service,
    private router: Router,
    private sessionService: SessionService,
  ) {
    this.userData$.subscribe((userData) => (this.userId = userData.userId!));
    this.route.queryParams.subscribe({
      next: (params: Params) => {
        const id: string = params['id'] || '';
        this.params.created_before_by_id = id;
        id?.length ? this.getPost(id) : (this.postDetails = undefined);

        this.postsService.postsFilters$.subscribe({
          next: () => {
            this.posts = undefined;
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
  }

  private getPosts(params: any): void {
    this.isLoading = true;
    this.postsService.getPosts('', params).subscribe({
      next: (data) => {
        this.posts?.length
          ? (this.posts = [...this.posts, ...data.results])
          : (this.posts = data.results);
        this.isLoading = false;
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

  public loadMore(): void {
    if (
      this.params.offset &&
      this.params.limit &&
      this.params.offset + this.params.limit < this.total
    ) {
      this.params.offset = this.params.offset + 10;
      this.getPosts(this.params);
    }
  }

  public showPostDetails(id: string): void {
    if (id !== this.postDetails?.id.toString()) {
      this.router.navigate(['/feed'], {
        queryParams: { id },
      });
    } else {
      this.router.navigate(['/feed']);
    }
  }

  // public onScroll(event: any): void {
  //   if (!this.isLoading && event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight) {
  //     this.loadMore();
  //   }
  // }
}
