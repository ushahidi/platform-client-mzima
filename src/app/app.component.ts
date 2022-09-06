import { Component } from '@angular/core';
import { LoaderService } from '@services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'platform-client';
  public isShowLoader: boolean;

  constructor(private loaderService: LoaderService) {
    this.loaderService.isActive.subscribe({
      next: (value) => {
        this.isShowLoader = value;
      },
    });
  }
}
