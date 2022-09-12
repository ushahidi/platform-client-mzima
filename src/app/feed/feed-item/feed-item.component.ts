import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { PostResult } from '@models';
import { PostsV5Service } from '@services';

@Component({
  selector: 'app-feed-item',
  templateUrl: './feed-item.component.html',
  styleUrls: ['./feed-item.component.scss'],
})
export class FeedItemComponent implements OnInit {
  public post: PostResult | null;

  constructor(private route: ActivatedRoute, private postsV5Service: PostsV5Service) {}

  ngOnInit() {
    this.route.paramMap.subscribe({
      next: (params: ParamMap) => {
        const id = params.get('id');
        if (id) {
          this.getPost(id);
        }
      },
    });
  }

  getPost(postId: string) {
    this.post = null;
    this.postsV5Service.getById(postId).subscribe({
      next: (post) => {
        this.post = post;
        console.log('post: ', this.post);
      },
    });
  }
}
