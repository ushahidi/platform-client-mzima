import { Component } from '@angular/core';
import { PostResult } from '../core/interfaces/posts.interface';
import { PostsService } from '../core/services/posts.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent {
  private params = {
    has_location: 'all',
    limit: 6,
    offset: 0,
    order: 'desc',
    order_unlocked_on_top: true,
    orderby: 'created',
    'source[]': ['sms', 'twitter', 'web', 'email'],
    'status[]': ['published', 'draft'],
  };
  public posts: PostResult[];
  public isLoading = false;
  public activePostId: any;
  public total: number;

  constructor(private postsService: PostsService) {
    this.getPosts();
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

  public loadMore(): void {
    this.params.offset = this.params.offset + 6;
    this.getPosts();
  }
}
