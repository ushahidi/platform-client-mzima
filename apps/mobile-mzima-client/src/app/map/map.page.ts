import { Component } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: 'map.page.html',
  styleUrls: ['map.page.scss'],
})
export class MapPage {
  public mode: number | 'fullscreen';
  public totalPosts = 0;

  public updatePostsCount(data: any): void {
    this.totalPosts = data.total;
  }
}
