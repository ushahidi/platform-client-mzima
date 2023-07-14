import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  MediaService,
  PostContent,
  PostContentField,
  PostResult,
  PostsService,
} from '@mzima-client/sdk';
import { LatLon } from '@models';
import { DatabaseService, NetworkService, SessionService } from '@services';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { lastValueFrom } from 'rxjs';
import { STORAGE_KEYS } from '@constants';
import { preparingVideoUrl } from '../core/validators/video-post.validator';

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
  public permissions: string[] = [];
  private user: { id?: string; role?: string } = {
    id: undefined,
    role: undefined,
  };
  public isConnection = true;
  public videoUrl: SafeResourceUrl;
  private queryParams: Params;

  constructor(
    private networkService: NetworkService,
    private router: Router,
    private route: ActivatedRoute,
    private postsService: PostsService,
    private mediaService: MediaService,
    protected sessionService: SessionService,
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

    this.route.queryParams.subscribe({
      next: (queryParams) => {
        this.queryParams = queryParams;
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

  public getPost(id: number | string) {
    this.isPostLoading = true;
    this.postsService
      .getById(id)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: async (post) => {
          this.post = post;
          console.log('post', this.post);
          this.checkPermissions();
          this.isPostLoading = false;
          this.preparingMediaField((this.post.post_content as PostContent[])[0].fields);
          this.preparingSafeVideoUrl((this.post.post_content as PostContent[])[0].fields);
        },
        error: (error) => {
          console.error('post loading error: ', error);
          this.isPostLoading = false;
        },
      });
  }

  private async preparingMediaField(fields: PostContentField[]): Promise<void> {
    fields
      .filter((field: any) => field.type === 'media')
      .map(async (mediaField) => {
        if (mediaField.value?.value) {
          const media = await this.getPostMedia(mediaField.value.value);
          mediaField.value.photoUrl = media.original_file_url;
          mediaField.value.caption = media.caption;
        }
      });
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
    this.router.navigate([this.queryParams['profile'] ? 'profile/posts' : '/']);
  }

  ngOnDestroy() {
    this.videoUrl = '';
  }
}
