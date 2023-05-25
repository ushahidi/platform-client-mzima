import { Component, Input, OnInit } from '@angular/core';
import { GeoJsonFilter, PostResult } from '@mzima-client/sdk';
import { UntilDestroy } from '@ngneat/until-destroy';
import { MainViewComponent } from '@shared';

@UntilDestroy()
@Component({
  selector: 'app-feed-view',
  templateUrl: './feed-view.component.html',
  styleUrls: ['./feed-view.component.scss'],
})
export class FeedViewComponent extends MainViewComponent implements OnInit {
  @Input() public atTop = false;
  @Input() public atBottom = false;

  public posts: PostResult[] = [];
  public isPostsLoading = true;
  public postCurrentLength = 0;
  public override params: GeoJsonFilter = {
    limit: 20,
    page: 1,
  };

  ngOnInit(): void {
    this.getPosts(this.params);
  }

  loadData(): void {
    this.params.page = 1;
    this.getPosts(this.params);
  }

  private getPosts(params: any): void {
    this.isPostsLoading = true;
    this.postsService.getPosts('', { ...params }).subscribe({
      next: (data) => {
        this.posts = [...this.posts, ...data.results];
        this.postCurrentLength = data.count;
        this.isPostsLoading = false;
      },
    });
  }
}
