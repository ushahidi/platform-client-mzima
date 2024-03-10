import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CollectionsComponent } from '../../shared/components';
import { TranslateService } from '@ngx-translate/core';
import { BreakpointService, EventBusService, EventType, SessionService } from '@services';
import { BaseComponent } from '../../base.component';
import { ShareModalComponent } from '../../shared/components';
import {
  PostPropertiesInterface,
  PostResult,
  PostsService,
  PostStatus,
  postHelpers,
} from '@mzima-client/sdk';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';

@Component({
  selector: 'app-post-head',
  templateUrl: './post-head.component.html',
  styleUrls: ['./post-head.component.scss'],
})
export class PostHeadComponent extends BaseComponent {
  PostStatus = PostStatus;
  @Input() public post: PostResult | PostPropertiesInterface;
  @Input() public editable: boolean;
  @Input() public feedView: boolean;
  @Input() public deleteable: boolean;
  @Output() edit = new EventEmitter();
  @Output() refresh = new EventEmitter();
  @Output() deleted = new EventEmitter();
  @Output() statusChanged = new EventEmitter();

  constructor(
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private postsService: PostsService,
    private dialog: MatDialog,
    private confirmModalService: ConfirmModalService,
    private translate: TranslateService,
    private eventBusService: EventBusService,
    private snackBar: MatSnackBar,
  ) {
    super(sessionService, breakpointService);
    this.checkDesktop();
    this.getUserData();
  }

  loadData(): void {}

  addToCollection() {
    const dialogRef = this.dialog.open(CollectionsComponent, {
      width: '100%',
      maxWidth: '768px',
      data: this.post,
      panelClass: 'modal',
    });

    dialogRef.afterClosed().subscribe({
      next: (response) => {
        this.refresh.emit();
        response ? console.log(response) : null;
      },
    });
  }

  underReview() {
    this.postsService.updateStatus(this.post.id, PostStatus.Draft).subscribe((res) => {
      this.post = res.result;
      this.statusChanged.emit();
    });
  }

  publish() {
    if (postHelpers.isAllRequiredCompleted(this.post)) {
      this.postsService.updateStatus(this.post.id, PostStatus.Published).subscribe((res) => {
        this.post = res.result;
        this.statusChanged.emit();
      });
    } else {
      this.showMessage(this.translate.instant('notify.post.unfinished_post_task'), 'error', 5000);
    }
  }

  archive() {
    this.postsService.updateStatus(this.post.id, PostStatus.Archived).subscribe((res) => {
      this.post = res.result;
      this.statusChanged.emit();
    });
  }

  async deletePost() {
    const confirmed = await this.confirmModalService.open({
      title: this.translate.instant('notify.post.destroy_confirm'),
    });
    if (!confirmed) return;

    this.postsService.delete(this.post.id).subscribe((res) => {
      this.post = res;
      this.deleted.emit();
      this.confirmModalService.open({
        title: this.translate.instant('notify.confirm_modal.deleted.success'),
        description: `<p>${this.translate.instant(
          'notify.confirm_modal.deleted.success_description',
          { count: 1 },
        )}</p>`,
        buttonSuccess: this.translate.instant('notify.confirm_modal.deleted.success_button'),
      });
    });
  }

  public editPost(event: Event) {
    event.stopPropagation();
    if (this.feedView) {
      this.eventBusService.next({
        type: EventType.EditPost,
        payload: this.post,
      });
    } else {
      this.edit.emit();
    }
  }
  public sharePost(event: Event) {
    event.preventDefault();
    event?.stopPropagation();
    this.dialog.open(ShareModalComponent, {
      width: '100%',
      maxWidth: 564,
      panelClass: 'modal',
      data: {
        postId: this.post.id,
        title: this.post.title,
        description: this.post.content,
        label: this.translate.instant('share.share_post'),
      },
    });
  }

  private showMessage(message: string, type: string, duration = 3000) {
    this.snackBar.open(message, 'Close', {
      panelClass: [type],
      duration,
    });
  }
}
