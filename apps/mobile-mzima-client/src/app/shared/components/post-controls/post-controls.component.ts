import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActionSheetButton, ModalController } from '@ionic/angular';
import { PostResult, PostStatus, PostsService } from '@mzima-client/sdk';
import { PostItemActionType, getPostStatusActions, postStatusChangedHeader } from '@constants';
import { forkJoin } from 'rxjs';
import { AlertService, DeploymentService, ShareService, ToastService } from '@services';
import { CollectionsModalComponent } from '../collections-modal/collections-modal.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-controls',
  templateUrl: './post-controls.component.html',
  styleUrls: ['./post-controls.component.scss'],
})
export class PostControlsComponent {
  @Input() posts: PostResult[] = [];
  @Input() permissions: string[] = [];
  @Input() isProfile?: boolean;
  @Output() postChanged = new EventEmitter();

  public isStatusOptionsOpen = false;
  public statusOptionsButtons?: ActionSheetButton[] = getPostStatusActions();

  constructor(
    private postsService: PostsService,
    private toastService: ToastService,
    private modalController: ModalController,
    private shareService: ShareService,
    private deploymentService: DeploymentService,
    private alertService: AlertService,
    private router: Router,
  ) {}

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
    if (!this.posts.length) return;
    forkJoin(this.posts.map((p) => this.postsService.updateStatus(p.id, status))).subscribe({
      complete: () => {
        this.toastService.presentToast({
          header: postStatusChangedHeader[status],
          message: `Post ${this.posts.length > 1 ? 'statuses' : 'status'} have been changed`,
          buttons: [],
        });
        this.postChanged.emit();
      },
    });
  }

  public openStatusOptions(): void {
    this.isStatusOptionsOpen = true;
  }

  public async addPostToCollection(): Promise<void> {
    if (!this.posts.length) return;

    const modal = await this.modalController.create({
      component: CollectionsModalComponent,
      componentProps: {
        postIds: this.posts[0].id,
      },
    });
    modal.onWillDismiss().then(({ data }) => {
      const { collections, changed } = data ?? {};
      if (changed && this.posts?.length) {
        this.posts.forEach((post) => {
          post.sets = collections;
        });
        this.toastService.presentToast({
          header: 'Success',
          message: `Post was ${
            collections?.length
              ? `added in ${collections.length} collections`
              : 'removed from all collections'
          }.`,
          buttons: [],
        });
        this.postChanged.emit();
      }
    });
    modal.present();
  }

  public sharePost(): void {
    if (!this.posts.length) return;

    const title = this.posts.map((post) => post.title).join(', ');
    const text = this.posts
      .map(
        (post) =>
          `https://${this.deploymentService.getDeployment().fqdn}/feed/${post.id}/view?mode=POST`,
      )
      .join(', ');
    this.shareService.share({
      title,
      text,
      dialogTitle: `Share ${this.posts.length > 1 ? 'post' : 'posts'}`,
    });
  }

  public async deletePost(): Promise<void> {
    const result = await this.alertService.presentAlert({
      header: `Are you sure you want to delete ${
        this.posts.length > 1 ? 'these posts' : 'this post'
      }?`,
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
      const count = this.posts.length;
      forkJoin(this.posts.map((p) => this.postsService.delete(p.id))).subscribe({
        complete: () => {
          this.toastService.presentToast({
            message: `${
              this.posts.length > 1 ? count + ' posts' : 'Post'
            } has been successfully deleted`,
          });
          this.postChanged.emit();
        },
      });
    }
  }

  public editPost(): void {
    if (!this.posts || this.posts.length > 1) return;
    this.router.navigate([this.posts[0].id, 'edit'], { queryParams: { profile: this.isProfile } });
  }
}
