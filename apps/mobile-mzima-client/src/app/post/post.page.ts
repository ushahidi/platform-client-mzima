import { Component, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionsModalComponent } from '@components';
import {
  getPostStatusActions,
  PostItemActionType,
  postStatusChangedHeader,
  postStatusChangedMessage,
  STORAGE_KEYS,
} from '@constants';
import { ActionSheetButton, ModalController } from '@ionic/angular';
import { LatLon } from '@models';
import {
  MediaService,
  PostContent,
  PostContentField,
  PostResult,
  PostsService,
  PostStatus,
} from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  AlertService,
  DatabaseService,
  DeploymentService,
  NetworkService,
  SessionService,
  ShareService,
  ToastService,
} from '@services';
import { preparingVideoUrl } from '@validators';
import { lastValueFrom } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-post',
  templateUrl: 'post.page.html',
  styleUrls: ['post.page.scss'],
})
export class PostPage implements OnDestroy {
  public post?: PostResult;
  public postId: string;
  public isPostLoading: boolean = true;
  public isMediaLoading: boolean;
  public location: LatLon;
  public isStatusOptionsOpen = false;
  public statusOptionsButtons?: ActionSheetButton[] = getPostStatusActions();
  public permissions: string[] = [];
  private user: { id?: string; role?: string } = {
    id: undefined,
    role: undefined,
  };
  public isConnection = true;
  public videoUrl: SafeResourceUrl;

  constructor(
    private networkService: NetworkService,
    private router: Router,
    private route: ActivatedRoute,
    private postsService: PostsService,
    private mediaService: MediaService,
    private toastService: ToastService,
    protected sessionService: SessionService,
    private shareService: ShareService,
    private alertService: AlertService,
    private modalController: ModalController,
    private deploymentService: DeploymentService,
    private databaseService: DatabaseService,
    private sanitizer: DomSanitizer,
  ) {
    this.sessionService.currentUserData$.pipe(untilDestroyed(this)).subscribe({
      next: ({ userId, role }) => {
        this.user = {
          id: userId ? String(userId) : undefined,
          role,
        };
        this.checkPermissions();
      },
    });
  }

  async ionViewWillEnter() {
    this.isConnection = await this.checkNetwork();
    this.postId = this.route.snapshot.params['id'];
    if (this.postId) {
      if (this.isConnection) {
        this.getPost(Number(this.postId));
      } else {
        this.post = await this.getPostFromDb(Number(this.postId));
        this.isPostLoading = false;
      }
    }
  }

  async getPostFromDb(postId: number) {
    const postDb = await this.databaseService.get(STORAGE_KEYS.POSTS);
    return postDb.results.find((post: any) => post.id === Number(postId));
  }

  private async checkNetwork(): Promise<boolean> {
    return this.networkService.checkNetworkStatus();
  }

  private async getPost(id: number) {
    this.isPostLoading = true;
    this.post = await this.getPostInformation(id);
    if (this.post) {
      this.isPostLoading = false;
      this.checkPermissions();
      this.isPostLoading = false;
      this.preparingMediaField((this.post.post_content as PostContent[])[0].fields);
      this.preparingSafeVideoUrl((this.post.post_content as PostContent[])[0].fields);
      this.preparingRelatedPosts((this.post.post_content as PostContent[])[0].fields);
    }
  }

  private preparingRelatedPosts(fields: PostContentField[]): void {
    console.log(fields);
    fields
      .filter((field: any) => field.type === 'relation')
      .map(async (relativeField) => {
        if (relativeField.value?.post_id) {
          const url = `https://${this.deploymentService.getDeployment().fqdn}/feed/${
            relativeField.value.post_id
          }/view?mode=POST`;
          const relative = await this.getPostInformation(relativeField.value.post_id);
          const { title } = relative;
          relativeField.value.postTitle = title;
          relativeField.value.postUrl = url;
        }
      });
  }

  private preparingMediaField(fields: PostContentField[]): void {
    fields
      .filter((field: any) => field.type === 'media')
      .map(async (mediaField) => {
        if (mediaField.value && mediaField.value?.value) {
          const media = await this.getPostMedia(mediaField.value.value);
          const { original_file_url: originalFileUrl, caption } = media;
          mediaField.value.photoUrl = originalFileUrl;
          mediaField.value.caption = caption;
        }
      });
  }

  private async getPostInformation(postId: number): Promise<any> {
    try {
      return lastValueFrom(this.postsService.getById(postId));
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  private async getPostMedia(mediaId: string): Promise<any> {
    try {
      return lastValueFrom(this.mediaService.getById(mediaId));
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  private preparingSafeVideoUrl(fields: PostContentField[]) {
    const videoField = fields.find((field: any) => field.input === 'video');
    if (videoField && videoField.value?.value) {
      this.videoUrl = this.generateSecurityTrustResourceUrl(
        preparingVideoUrl(videoField.value?.value),
      );
    }
  }

  private generateSecurityTrustResourceUrl(unsafeUrl: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
  }

  private checkPermissions(): void {
    this.permissions = [];
    if (this.user.role === 'member') {
      this.permissions = ['add_to_collection'];
    }
    if (this.user.role === 'admin' || this.user.id === String(this.post?.user_id)) {
      this.permissions = ['add_to_collection', 'edit'];
    }
    if (this.user.role === 'admin') {
      this.permissions = ['add_to_collection', 'edit', 'change_status'];
    }
  }

  public back(): void {
    this.router.navigate(['/']);
  }

  public openStatusOptions(): void {
    this.isStatusOptionsOpen = true;
  }

  public setStatus(ev: any): void {
    this.isStatusOptionsOpen = false;
    const role = ev.detail.role;
    if (role === 'cancel' || !ev.detail.data) return;
    const action: PostItemActionType = ev.detail.data.action;
    const actions: Partial<Record<PostItemActionType, () => void>> = {
      [PostItemActionType.PUBLISH]: () => this.setPostStatus(PostStatus.Published),
      [PostItemActionType.PUT_UNDER_REVIEW]: () => this.setPostStatus(PostStatus.Draft),
      [PostItemActionType.ARCHIVE]: () => this.setPostStatus(PostStatus.Archived),
    };

    actions[action]?.();
  }

  private setPostStatus(status: PostStatus): void {
    if (!this.post) return;
    this.postsService.updateStatus(this.post.id, status).subscribe((res) => {
      this.post = res.result;
      this.toastService.presentToast({
        header: postStatusChangedHeader[status],
        message: postStatusChangedMessage(status, this.post!.title),
        buttons: [],
      });
    });
  }

  public sharePost(): void {
    if (!this.post) return;
    this.shareService.share({
      title: this.post.title,
      text: this.post.title,
      url: `https://${this.deploymentService.getDeployment().fqdn}/feed/${
        this.post.id
      }/view?mode=POST`,
      dialogTitle: 'Share Post',
    });
  }

  public async deletePost(): Promise<void> {
    const result = await this.alertService.presentAlert({
      header: 'Are you sure you want to delete this post?',
      message: 'This action cannot be undone. Please proceed with caution.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'confirm',
          cssClass: 'danger',
        },
      ],
    });

    if (result.role === 'confirm') {
      this.postsService.delete(this.post!.id).subscribe({
        next: () => {
          this.router.navigate(['/']);
          this.toastService.presentToast({
            message: 'Post has been successfully deleted',
          });
        },
      });
    }
  }

  public editPost(): void {
    if (!this.post) return;
    this.router.navigate([this.post.id, 'edit']);
  }

  public async addPostToCollection(): Promise<void> {
    const modal = await this.modalController.create({
      component: CollectionsModalComponent,
      componentProps: {
        postId: this.post!.id,
        selectedCollections: new Set(this.post!.sets ?? []),
      },
    });
    modal.onWillDismiss().then(({ data }) => {
      const { collections, changed } = data ?? {};
      if (changed && this.post) {
        this.post.sets = collections;
        this.toastService.presentToast({
          header: 'Success',
          message: `The post “${this.post.title}” was ${
            collections?.length
              ? `added in ${collections.length} collections`
              : 'removed from all collections'
          }.`,
          buttons: [],
        });
      }
    });
    modal.present();
  }

  ngOnDestroy() {
    this.videoUrl = '';
  }
}
