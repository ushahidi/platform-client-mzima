import { Component, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { STORAGE_KEYS } from '@constants';
import { AlertController, IonRouterOutlet, Platform } from '@ionic/angular';
import { CollectionsService, MediaService, PostsService, SurveysService } from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DatabaseService } from '@services';
import { distinctUntilChanged, filter } from 'rxjs';
import { BaseComponent } from './base.component';
import { NetworkService } from './core/services/network.service';
import { ToastService } from './core/services/toast.service';
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
    override toastService: ToastService,
    override alertCtrl: AlertController,
    override networkService: NetworkService,
    private dataBaseService: DatabaseService,
    private mediaService: MediaService,
    private postsService: PostsService,
    private collectionsService: CollectionsService,
    private surveysService: SurveysService,
    @Optional() override routerOutlet?: IonRouterOutlet,
  ) {
    super(router, platform, toastService, alertCtrl, networkService, routerOutlet);
    this.networkService.networkStatus$
      .pipe(
        distinctUntilChanged(),
        filter((value) => value === true),
        untilDestroyed(this),
      )
      .subscribe({
        next: async () => {
          this.getCollections();
          this.getSurveys();

          const result = await this.checkPendingPosts();
          //TODO: Remove after testing
          console.log('checkPendingPosts', result);

          if (result) this.uploadPendingPosts();
        },
      });
  }

  private getCollections(query = '') {
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

  private getSurveys() {
    this.surveysService
      .getSurveys('', {
        page: 1,
        order: 'asc',
        limit: 0,
      })
      .subscribe({
        next: (response) => {
          this.dataBaseService.set(STORAGE_KEYS.SURVEYS, response.results);
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
