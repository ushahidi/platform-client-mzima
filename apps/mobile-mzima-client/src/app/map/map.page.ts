import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-map',
  templateUrl: 'map.page.html',
  styleUrls: ['map.page.scss'],
})
export class MapPage {
  public mode: number | 'fullscreen';
  public totalPosts = 0;

  constructor(private router: Router) {}

  public updatePostsCount(data: any): void {
    this.totalPosts = data.total;
  }

  public createPost() {
    this.router.navigate(['/post-edit']);
  }
}
