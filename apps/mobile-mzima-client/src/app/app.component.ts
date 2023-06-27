import { Component, OnInit, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { STORAGE_KEYS } from '@constants';
import { AlertController, IonRouterOutlet, Platform } from '@ionic/angular';
import { CollectionsService, MediaService, PostsService, SurveysService } from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DatabaseService, NetworkService, ToastService } from '@services';
import {
  BehaviorSubject,
  concatMap,
  delay,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  from,
  tap,
} from 'rxjs';
import { BaseComponent } from './base.component';
import { UploadFileHelper } from './post/helpers';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent extends BaseComponent implements OnInit {
  private toastMessage$ = new BehaviorSubject<string>('');

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

    this.initToastMessageListener();
    this.initNetworkListener();
  }

  check() {
    this.toastMessage$.next('Check toast');
  }

  ngOnInit() {
    this.toastMessage$.next('Check toast');
  }

  private initToastMessageListener() {
    this.toastMessage$.pipe(untilDestroyed(this)).subscribe((message) => {
      console.log('toastMessage$', message);
      this.toastService.showToast(message);
    });
  }

  private initNetworkListener() {
    this.networkService.networkStatus$
      .pipe(
        distinctUntilChanged(),
        filter((value) => value === true),
        untilDestroyed(this),
        concatMap(() => this.getCollections().pipe(delay(2000))),
        concatMap(() => this.getSurveys().pipe(delay(2000))),
        concatMap(() => from(this.checkPendingPosts()).pipe(delay(2000))),
      )
      .subscribe(async (result) => {
        if (result) await this.uploadPendingPosts();
      });
  }

  private getCollections(query = '') {
    let params: any = new Map();
    params = {
      orderby: 'created',
      order: 'desc',
      q: query,
    };

    return this.collectionsService.getCollections(params).pipe(
      tap(async (response) => {
        await this.dataBaseService.set(STORAGE_KEYS.COLLECTIONS, response.results);
        this.toastMessage$.next('Collections data updated');
      }),
    );
  }

  private getSurveys() {
    return this.surveysService
      .getSurveys('', {
        page: 1,
        order: 'asc',
        limit: 0,
      })
      .pipe(
        tap(async (response) => {
          await this.dataBaseService.set(STORAGE_KEYS.SURVEYS, response.results);
          this.toastMessage$.next('Surveys data updated');
        }),
      );
  }

  async checkPendingPosts(): Promise<boolean> {
    const posts: any[] = await this.dataBaseService.get(STORAGE_KEYS.PENDING_POST_KEY);
    if (posts?.length) this.toastMessage$.next('Pending posts found');
    return !!posts?.length;
  }

  async uploadPendingPosts() {
    const posts: any[] = await this.dataBaseService.get(STORAGE_KEYS.PENDING_POST_KEY);
    for (let post of posts) {
      if (post?.file?.upload)
        post = await new UploadFileHelper(this.mediaService).uploadFile(post, post.file);
      await firstValueFrom(this.postsService.post(post));
    }
    this.toastMessage$.next('All pending posts uploaded to the server');
    await this.dataBaseService.set(STORAGE_KEYS.PENDING_POST_KEY, []);
  }
}
