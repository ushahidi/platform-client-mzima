import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CollectionsComponent } from '@data';
import { PostPropertiesInterface, PostResult, PostStatus, UserInterface } from '@models';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { BreakpointService, SessionService } from '@services';
import { ShareModalComponent } from '../../shared/components';
import { PostsV5Service } from '../../core/services/posts.v5.service';
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
  @Output() deleted = new EventEmitter();
  @Output() statusChanged = new EventEmitter();
  public isDesktop = false;

  constructor(
    private session: SessionService,
    private postsV5Service: PostsV5Service,
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
        response ? console.log(response) : null;
      },
    });
  }

  underReview() {
    this.postsV5Service.updateStatus(this.post.id, PostStatus.Draft).subscribe((res) => {
      this.post = res.result;
      this.statusChanged.emit();
    });
  }

  publish() {
    this.postsV5Service.updateStatus(this.post.id, PostStatus.Published).subscribe((res) => {
      this.post = res.result;
      this.statusChanged.emit();
    });
  }

  archive() {
    this.postsV5Service.updateStatus(this.post.id, PostStatus.Archived).subscribe((res) => {
      this.post = res.result;
      this.statusChanged.emit();
    });
  }

  async deletePost() {
    const confirmed = await this.confirmModalService.open({
      title: this.translate.instant('notify.post.destroy_confirm'),
    });
    if (!confirmed) return;

    this.postsV5Service.delete(this.post.id).subscribe((res) => {
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
    this.isDesktop
      ? this.router.navigateByUrl(`/feed/${this.post.id}/edit?mode=POST`)
      : this.edit.emit();
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
