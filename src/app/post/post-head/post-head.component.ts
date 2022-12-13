import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CollectionsComponent } from '@data';
import { PostPropertiesInterface, PostResult, PostStatus } from '@models';
import { ConfirmModalService, PostsService, PostsV5Service, SessionService } from '@services';

@Component({
  selector: 'app-post-head',
  templateUrl: './post-head.component.html',
  styleUrls: ['./post-head.component.scss'],
})
export class PostHeadComponent implements OnInit {
  PostStatus = PostStatus;
  @Input() public post: PostResult | PostPropertiesInterface;
  isActionsAvailable = false;

  constructor(
    private session: SessionService,
    private postsV5Service: PostsV5Service,
    private postsService: PostsService,
    private dialog: MatDialog,
    private confirmModalService: ConfirmModalService,
  ) {}

  ngOnInit() {
    this.session.isLogged$.subscribe((isLogged) => {
      this.isActionsAvailable = isLogged;
    });
  }

  addToCollection() {
    const dialogRef = this.dialog.open(CollectionsComponent, {
      width: '100%',
      maxWidth: '768px',
      data: this.post,
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
      title: 'notify.post.destroy_confirm',
    });
    if (!confirmed) return;

    this.postsV5Service.delete(this.post.id).subscribe((res) => {
      this.post = res;
      this.postsService.applyFilters({});
    });
  }
}
