import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CollectionsComponent } from '@data';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { BreakpointService, SessionService } from '@services';
import { ShareModalComponent } from '../../shared/components';
import {
  PostPropertiesInterface,
  PostResult,
  PostsService,
  PostStatus,
  UserInterface,
} from '@mzima-client/sdk';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';

@UntilDestroy()
@Component({
  selector: 'app-post-head',
  templateUrl: './post-head.component.html',
  styleUrls: ['./post-head.component.scss'],
})
export class PostHeadComponent {
  PostStatus = PostStatus;
  @Input() public post: PostResult | PostPropertiesInterface;
  @Input() public user: UserInterface;
  @Input() public editable: boolean;
  @Input() public deleteable: boolean;
  @Output() edit = new EventEmitter();
  @Output() refresh = new EventEmitter();
  @Output() deleted = new EventEmitter();
  @Output() statusChanged = new EventEmitter();
  public isDesktop = false;

  constructor(
    private session: SessionService,
    private postsService: PostsService,
    private dialog: MatDialog,
    private confirmModalService: ConfirmModalService,
    private translate: TranslateService,
    private router: Router,
    private breakpointService: BreakpointService,
  ) {
    this.breakpointService.isDesktop$.pipe(untilDestroyed(this)).subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
      },
    });
  }

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
    this.postsService.updateStatus(this.post.id, PostStatus.Published).subscribe((res) => {
      this.post = res.result;
      this.statusChanged.emit();
    });
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
    this.edit.emit();
  }

  public sharePost() {
    event?.stopPropagation();
    this.dialog.open(ShareModalComponent, {
      width: '100%',
      maxWidth: 564,
      panelClass: 'modal',
      data: {
        postId: this.post.id,
        title: this.post.title,
        description: this.post.content,
      },
    });
  }
}
