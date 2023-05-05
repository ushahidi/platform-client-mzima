import { Component, OnInit } from '@angular/core';
import { GeoJsonFilter, PostsService } from '@mzima-client/sdk';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page implements OnInit {
  params: GeoJsonFilter = {
    has_location: 'all',
    limit: 20,
    offset: 0,
    order: 'desc',
    order_unlocked_on_top: true,
    orderby: 'created',
    'source[]': [],
    'status[]': ['published', 'draft'],
  };

  constructor(private postsService: PostsService) {}

  ngOnInit() {
    this.getPosts();
  }

  getPosts() {
    this.postsService.getPosts('', this.params).subscribe({
      next: (response) => {
        console.log(response.results);
      },
    });
  }
}
