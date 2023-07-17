import { Component, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  MediaService,
  PostContent,
  PostContentField,
  PostResult,
  PostsService,
} from '@mzima-client/sdk';
import { LatLon } from '@models';
import { DatabaseService, DeploymentService, NetworkService, SessionService } from '@services';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { preparingVideoUrl } from '@validators';
import { lastValueFrom } from 'rxjs';
import { STORAGE_KEYS } from '@constants';

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
    private deploymentService: DeploymentService,
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

  private async getPost(id: number) {
    this.isPostLoading = true;
    this.post = await this.getPostInformation(id);
    if (this.post) {
      this.isPostLoading = false;
      this.checkPermissions();
      this.isPostLoading = false;
      this.preparingMediaField((this.post.post_content as PostContent[])[0].fields);
      this.preparingSafeVideoUrl((this.post.post_content as PostContent[])[0].fields);
      this.preparingRelatedPosts((this.post.post_content as PostContent[])[0].fields);
    }
  }

  private preparingRelatedPosts(fields: PostContentField[]): void {
    console.log(fields);
    fields
      .filter((field: any) => field.type === 'relation')
      .map(async (relativeField) => {
        if (relativeField.value?.post_id) {
          const url = `https://${this.deploymentService.getDeployment().fqdn}/feed/${
            relativeField.value.post_id
          }/view?mode=POST`;
          const relative = await this.getPostInformation(relativeField.value.post_id);
          const { title } = relative;
          relativeField.value.postTitle = title;
          relativeField.value.postUrl = url;
        }
      });
  }

  private preparingMediaField(fields: PostContentField[]): void {
    fields
      .filter((field: any) => field.type === 'media')
      .map(async (mediaField) => {
        if (mediaField.value && mediaField.value?.value) {
          const media = await this.getPostMedia(mediaField.value.value);
          const { original_file_url: originalFileUrl, caption } = media;
          mediaField.value.photoUrl = originalFileUrl;
          mediaField.value.caption = caption;
        }
      });
  }

  private async getPostInformation(postId: number): Promise<any> {
    try {
      return lastValueFrom(this.postsService.getById(postId));
    } catch (err) {
      console.error(err);
      return err;
    }
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
