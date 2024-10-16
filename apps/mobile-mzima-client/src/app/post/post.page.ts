import { Component, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  MediaService,
  PostContent,
  PostContentField,
  postHelpers,
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
  public postId: number;
  public isPostLoading: boolean = true;
  public isMediaLoading: boolean;
  public location: LatLon;
  public permissions: string[] = [];
  public user: { id?: number; role?: string; permissions?: any } = {
    id: undefined,
    role: undefined,
    permissions: undefined,
  };
  public isConnection = true;
  public videoUrls: any[] = [];
  private queryParams: Params;
  public isManagePosts: boolean = false;

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
      next: ({ userId, role, permissions }) => {
        this.user = {
          id: userId ? Number(userId) : undefined,
          role,
          permissions,
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
    this.postId = Number(this.route.snapshot.params['id']);
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

  public async getPost(id: number) {
    this.isPostLoading = true;
    this.post = await this.getPostInformation(id);
    if (this.post) {
      this.isPostLoading = false;
      this.checkPermissions();
      this.getData(this.post);
      this.post.post_content = postHelpers.markCompletedTasks(
        this.post?.post_content || [],
        this.post,
      );
      this.post.post_content = postHelpers.replaceNewlinesWithBreaks(this.post?.post_content || []);
      this.post.content = postHelpers.replaceNewlinesInString(this.post.content);

      this.saveOpenedPostToDb(this.post);
    }
  }

  private async saveOpenedPostToDb(post: PostResult) {
    const dataFromDb = await this.databaseService.get(STORAGE_KEYS.POSTS);
    if (
      dataFromDb?.results.length &&
      !dataFromDb.results.some((el: PostResult) => el.id === post.id)
    ) {
      dataFromDb.results.push(post);
      dataFromDb.results.sort((a: PostResult, b: PostResult) => a.id - b.id);
      dataFromDb.count = dataFromDb.results.length;
      await this.databaseService.set(STORAGE_KEYS.POSTS, dataFromDb);
    }
  }

  private getData(post: PostResult): void {
    for (const content of post.post_content as PostContent[]) {
      this.preparingSafeVideoUrls(content.fields);
      this.preparingRelatedPosts(content.fields);
    }
  }

  private preparingRelatedPosts(fields: PostContentField[]): void {
    fields
      .filter((field: any) => field.type === 'relation')
      .map(async (relativeField) => {
        if (relativeField.value?.value) {
          const url = `https://${this.deploymentService.getDeployment()!.fqdn}/feed/${
            relativeField.value.value
          }/view?mode=ID`;
          const relative = await this.getPostInformation(relativeField.value.value);
          const { title } = relative;
          relativeField.value.postTitle = title;
          relativeField.value.postUrl = url;
        }
      });
  }

  private async getPostInformation(postId: number): Promise<any> {
    try {
      return await lastValueFrom(this.postsService.getById(postId));
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  private preparingSafeVideoUrls(fields: PostContentField[]) {
    this.videoUrls = fields
      .filter((field: any) => field.input === 'video' && field.value?.value)
      .map((videoField) => {
        const rawUrl = preparingVideoUrl(videoField.value?.value);
        const safeUrl = this.generateSecurityTrustResourceUrl(rawUrl);
        return {
          rawUrl: rawUrl,
          safeUrl: safeUrl,
        };
      });
  }

  private generateSecurityTrustResourceUrl(unsafeUrl: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
  }

  private checkPermissions(): void {
    this.permissions = [];
    if (this.user.role === 'member') {
      this.permissions = ['add_to_collection'];
    }
    if (this.user.role === 'admin' || this.user.id === this.post?.user_id) {
      this.permissions = ['add_to_collection', 'edit'];
    }
    if (this.user.role === 'admin') {
      this.permissions = ['add_to_collection', 'edit', 'change_status'];
    }

    this.isManagePosts = this.user.permissions?.includes('Manage Posts') ?? false;
  }

  public back(): void {
    this.router.navigate([this.queryParams['profile'] ? 'profile/posts' : '/']);
  }

  ngOnDestroy() {
    this.videoUrls = [];
  }
}
