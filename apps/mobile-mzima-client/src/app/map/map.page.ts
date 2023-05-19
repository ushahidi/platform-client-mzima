import { Component } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: 'map.page.html',
  styleUrls: ['map.page.scss'],
})
export class MapPage {
  public mode: number | 'fullscreen';

  public checkIsFullscreen(mode: number | 'fullscreen'): void {
    this.mode = mode;
  }
}
