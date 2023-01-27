import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CollectionsComponent } from '@data';
import { PostPropertiesInterface, PostResult, PostStatus, UserInterface } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmModalService, PostsService, PostsV5Service, SessionService } from '@services';
import { ShareModalComponent } from 'src/app/shared/components/share-modal/share-modal.component';

@Component({
  selector: 'app-post-head',
  templateUrl: './post-head.component.html',
  styleUrls: ['./post-head.component.scss'],
})
export class PostHeadComponent {
  PostStatus = PostStatus;
  @Input() public post: PostResult | PostPropertiesInterface;
  @Input() public user: UserInterface;

  constructor(
    private session: SessionService,
    private postsV5Service: PostsV5Service,
    private postsService: PostsService,
    private dialog: MatDialog,
    private confirmModalService: ConfirmModalService,
    private translate: TranslateService,
    private router: Router,
  ) {}

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
      this.post = res;
      this.postsService.applyFilters({});
    });
  }

  publish() {
    this.postsV5Service.updateStatus(this.post.id, PostStatus.Published).subscribe((res) => {
      this.post = res;
      this.postsService.applyFilters({});
    });
  }

  archive() {
    this.postsV5Service.updateStatus(this.post.id, PostStatus.Archived).subscribe((res) => {
      this.post = res;
      this.postsService.applyFilters({});
    });
  }

  async delete() {
    const confirmed = await this.confirmModalService.open({
      title: this.translate.instant('notify.post.destroy_confirm'),
    });
    if (!confirmed) return;

    this.postsV5Service.delete(this.post.id).subscribe((res) => {
      this.post = res;
      this.postsService.applyFilters({});
    });
  }

  public editPost() {
    this.router.navigateByUrl(`/post/${this.post.id}/edit`);
  }

  public sharePost() {
    event?.stopPropagation();
    this.dialog.open(ShareModalComponent, {
      width: '100%',
      maxWidth: 564,
      panelClass: 'modal',
      data: {
        postId: this.post.id,
      },
    });
  }
}
