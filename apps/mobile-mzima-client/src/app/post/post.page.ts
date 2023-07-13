import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MediaService, PostResult, PostsService } from '@mzima-client/sdk';
import { LatLon } from '@models';
import { SessionService } from '@services';
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
  public permissions: string[] = [];
  private user: { id?: string; role?: string } = {
    id: undefined,
    role: undefined,
  };
  private queryParams: Params;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private postsService: PostsService,
    private mediaService: MediaService,
    protected sessionService: SessionService,
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

    this.route.queryParams.subscribe({
      next: (queryParams) => {
        this.queryParams = queryParams;
      },
    });
  }

  ionViewWillEnter() {
    this.postId = this.route.snapshot.params['id'];
    if (this.postId) {
      this.getPost(this.postId);
    }
  }

  public getPost(id: string) {
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
    this.router.navigate([this.queryParams['profile'] ? 'profile/posts' : '/']);
  }
}
