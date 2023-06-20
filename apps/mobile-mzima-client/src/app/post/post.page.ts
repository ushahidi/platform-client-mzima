import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MediaService, PostResult, PostStatus, PostsService } from '@mzima-client/sdk';
import { LatLon } from '@models';
import { ActionSheetButton } from '@ionic/angular';
import {
  PostItemActionType,
  getPostStatusActions,
  postStatusChangedHeader,
  postStatusChangedMessage,
} from '@constants';
import { AlertService, EnvService, SessionService, ShareService, ToastService } from '@services';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-post',
  templateUrl: 'post.page.html',
  styleUrls: ['post.page.scss'],
})
export class PostPage {
  public post?: PostResult;
  public postId: string;
  public isPostLoading: boolean = true;
  public media: any;
  public mediaId?: number;
  public isMediaLoading: boolean;
  public location: LatLon;
  public isStatusOptionsOpen = false;
  public statusOptionsButtons?: ActionSheetButton[] = getPostStatusActions();
  public permissions: string[] = [];
  private user: { id?: string; role?: string } = {
    id: undefined,
    role: undefined,
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private postsService: PostsService,
    private mediaService: MediaService,
    private toastService: ToastService,
    protected sessionService: SessionService,
    private shareService: ShareService,
    private envService: EnvService,
    private alertService: AlertService,
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

  ionViewWillEnter() {
    this.postId = this.route.snapshot.params['id'];
    if (this.postId) {
      this.getPost(this.postId);
    }
  }

  private getPost(id: string) {
    this.isPostLoading = true;
    this.postsService
      .getById(id)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: async (post) => {
          this.post = post;
          this.checkPermissions();

          this.isPostLoading = false;

          this.mediaId = this.post!.post_content?.flatMap((c) => c.fields).find(
            (f) => f.input === 'upload',
          )?.value?.value;

          this.location = this.post!.post_content?.flatMap((c) => c.fields).find(
            (f) => f.input === 'location',
          )?.value?.value;

          if (this.mediaId) {
            this.isMediaLoading = true;
            this.mediaService.getById(String(this.mediaId)).subscribe({
              next: (media) => {
                this.isMediaLoading = false;
                this.media = media;
              },
              error: () => {
                this.isMediaLoading = false;
              },
            });
          }
        },
        error: (error) => {
          console.error('post loading error: ', error);
          this.isPostLoading = false;
        },
      });
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
      url: `${this.envService.deploymentUrl}feed/${this.post.id}/view?mode=POST`,
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
        },
      });
    }
  }

  public editPost(): void {
    console.log('edit post');
  }

  public addPostToCollection(): void {
    // TODO: add post to collection
    console.log('add post to collection');
  }
}
