import { Injectable } from '@angular/core';
import { EnvService } from '@services';
import { PostsService } from '@mzima-client/sdk';

@Injectable({
  providedIn: 'root',
})
export class ListenerService {
  constructor(private postsService: PostsService, private envService: EnvService) {}

  public changeDeploymentListener(): void {
    this.envService.deployment$.subscribe({
      next: () => {
        this.postsService.getApi();
      },
    });
  }
}
