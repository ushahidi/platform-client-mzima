import { Component, Input, OnInit } from '@angular/core';
import { MediaService, PostResult } from '@mzima-client/sdk';
import { getPostItemActions, PostItemActionType, PostItemActionTypeUserRole } from '@constants';
import { ActionSheetButton } from '@ionic/angular';
import { SessionService } from '@services';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-post-item',
  templateUrl: './post-item.component.html',
  styleUrls: ['./post-item.component.scss'],
})
export class PostItemComponent implements OnInit {
  @Input() public post: PostResult;
  public media: any;
  public mediaId?: number;
  public isMediaLoading: boolean;
  public isActionsOpen = false;
  public actionSheetButtons?: ActionSheetButton[] = getPostItemActions();

  constructor(private mediaService: MediaService, protected sessionService: SessionService) {
    this.sessionService.currentUserData$.pipe(untilDestroyed(this)).subscribe({
      next: ({ role, userId }) => {
        if (role === 'admin') {
          this.actionSheetButtons = getPostItemActions(PostItemActionTypeUserRole.ADMIN);
        } else if (String(userId) === String(this.post.user_id)) {
          this.actionSheetButtons = getPostItemActions(PostItemActionTypeUserRole.AUTHOR);
        } else if (role === 'member') {
          this.actionSheetButtons = getPostItemActions(PostItemActionTypeUserRole.USER);
        } else {
          this.actionSheetButtons = getPostItemActions();
        }
      },
    });
  }

  ngOnInit(): void {
    this.mediaId = this.post.post_content
      ?.flatMap((c) => c.fields)
      .find((f) => f.input === 'upload')?.value?.value;

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
  }

  public makeAction(ev: any) {
    this.isActionsOpen = false;
    const role = ev.detail.role;
    if (role === 'cancel' || !ev.detail.data) return;
    const action: PostItemActionType = ev.detail.data.action;

    const actions: Record<PostItemActionType, () => void> = {
      [PostItemActionType.SHARE]: () => this.sharePost(),
      [PostItemActionType.EDIT]: () => this.editPost(),
      [PostItemActionType.ADD_TO_COLLECTION]: () => this.addToCollection(),
      [PostItemActionType.PUBLISH]: () => this.setPostStatus(PostItemActionType.PUBLISH),
      [PostItemActionType.PUT_UNDER_REVIEW]: () =>
        this.setPostStatus(PostItemActionType.PUT_UNDER_REVIEW),
      [PostItemActionType.ARCHIVE]: () => this.setPostStatus(PostItemActionType.ARCHIVE),
      [PostItemActionType.DELETE]: () => this.deletePost(),
    };

    actions[action]();
  }

  private sharePost(): void {
    // TODO: share post
    console.log('share post');
  }

  private editPost(): void {
    // TODO: edit post
    console.log('edit post');
  }

  private addToCollection(): void {
    // TODO: add post to collection
    console.log('add post to collection');
  }

  private setPostStatus(status: PostItemActionType): void {
    // TODO: set post status
    console.log('set post status: ', status);
  }

  private deletePost(): void {
    // TODO: delete post
    console.log('delete post');
  }
}
