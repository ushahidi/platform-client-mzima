import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PostResult } from '../core/interfaces/posts.interface';
import { PostsService } from '../core/services/posts.service';
import { PostsV5Service } from '../core/services/posts.v5.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent {
  private params = {
    has_location: 'all',
    limit: 10,
    offset: 0,
    order: 'desc',
    order_unlocked_on_top: true,
    created_before_by_id: '',
    orderby: 'created',
    'source[]': ['sms', 'twitter', 'web', 'email'],
    'status[]': ['published', 'draft'],
  };
  public posts: PostResult[];
  public isLoading = false;
  public activePostId: any;
  public total: number;
  public postDetails?: PostResult;
  public isPostLoading: boolean;

  constructor(
    private postsService: PostsService,
    private route: ActivatedRoute,
    private postsV5Service: PostsV5Service,
    private router: Router,
  ) {
    this.route.queryParams.subscribe({
      next: (params: Params) => {
        const id: string = params['id'] || '';
        this.params.created_before_by_id = id;
        id?.length ? this.getPost(id) : (this.postDetails = undefined);
        if (!this.posts?.length) {
          this.getPosts();
        }
      },
    });
  }

  private getPosts(): void {
    this.isLoading = true;
    this.postsService.getPosts('', this.params).subscribe({
      next: (data) => {
        this.total = data.total_count;
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
    if (this.params.offset + this.params.limit < this.total) {
      this.params.offset = this.params.offset + 10;
      this.getPosts();
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
