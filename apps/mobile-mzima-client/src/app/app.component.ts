import { Component, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { STORAGE_KEYS } from '@constants';
import { AlertController, IonRouterOutlet, Platform, ToastController } from '@ionic/angular';
import { CollectionsService, MediaService, PostsService } from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DatabaseService } from '@services';
import { BaseComponent } from './base.component';
import { NetworkService } from './core/services/network.service';
import { UploadFileHelper } from './post/helpers';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent extends BaseComponent {
  constructor(
    override router: Router,
    override platform: Platform,
    override toastCtrl: ToastController,
    override alertCtrl: AlertController,
    private networkService: NetworkService,
    private dataBaseService: DatabaseService,
    private mediaService: MediaService,
    private postsService: PostsService,
    private collectionsService: CollectionsService,
    @Optional() override routerOutlet?: IonRouterOutlet,
  ) {
    super(router, platform, toastCtrl, alertCtrl, routerOutlet);
    this.networkService.networkStatus$.pipe(untilDestroyed(this)).subscribe({
      next: async (value) => {
        if (value) {
          this.getCollections();

          const result = await this.checkPendingPosts();
          if (result) this.uploadPendingPosts();
        }
      },
    });
  }

  getCollections(query = '') {
    let params: any = new Map();
    params = {
      orderby: 'created',
      order: 'desc',
      q: query,
    };

    this.collectionsService.getCollections(params).subscribe({
      next: (response) => {
        this.dataBaseService.set(STORAGE_KEYS.COLLECTIONS, response.results);
      },
    });
  }

  async checkPendingPosts(): Promise<boolean> {
    const posts: any[] = await this.dataBaseService.get(STORAGE_KEYS.PENDING_POST_KEY);
    return !!posts?.length;
  }

  async uploadPendingPosts() {
    const posts: any[] = await this.dataBaseService.get(STORAGE_KEYS.PENDING_POST_KEY);
    for (let post of posts) {
      if (post?.file?.upload)
        post = await new UploadFileHelper(this.mediaService).uploadFile(post, post.file);
      this.postsService.post(post).subscribe({
        complete: async () => {},
      });
    }
  }
}
