import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router, ResolveEnd } from '@angular/router';
import { Permissions } from '@enums';
import {
  CategoryInterface,
  MediaFile,
  MediaFileStatus,
  MediaService,
  PostContent,
  PostContentField,
  postHelpers,
  PostResult,
  PostsService,
  SurveysService,
} from '@mzima-client/sdk';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { BaseComponent } from '../../base.component';
import { preparingVideoUrl } from '../../core/helpers/validators';
import { dateHelper } from '@helpers';
import { BreakpointService, EventBusService, EventType, SessionService } from '@services';

@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.scss'],
})
export class PostDetailsComponent extends BaseComponent implements OnChanges, OnDestroy, OnInit {
  @Input() postFromModal: PostResult;
  @Input() feedView: boolean = true;
  @Input() userId?: number | string;
  @Input() color?: string;
  @Input() twitterId?: string;
  @Output() edit = new EventEmitter();
  @Output() refresh = new EventEmitter();
  @Output() statusChanged = new EventEmitter();
  public allowed_privileges: string | string[];
  public postId: number;
  public videoUrls: any[] = [];
  public isPostLoading: boolean = true;
  public isManagePosts: boolean = false;
  public postChanged: boolean;
  public post: PostResult;
  private dataSubscription: Subscription;
  constructor(
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private mediaService: MediaService,
    private metaService: Meta,
    private route: ActivatedRoute,
    private router: Router,
    private postsService: PostsService,
    private surveyService: SurveysService,
    protected sanitizer: DomSanitizer,
    private eventBusService: EventBusService,
  ) {
    super(sessionService, breakpointService);
    this.getUserData();
    this.checkPermission();
    this.userId = Number(this.user.userId);
    this.router.events.subscribe((ev) => {
      if (ev instanceof ResolveEnd) {
        this.dataSubscription.unsubscribe();
      }
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        //----------------------
        this.postChanged = true;
        //----------------------
        this.allowed_privileges = localStorage.getItem('USH_allowed_privileges') ?? '';
        this.postId = Number(params['id']);
      }
    });
    if (this.postFromModal) {
      this.post = this.postFromModal;
      this.postChanged = false;
    } else {
      this.dataSubscription = this.route.data.subscribe((data) => {
        this.post = data['post'];
        if (this.post) this.getSurvey();
      });
    }
  }

  loadData(): void {}

  private checkPermission() {
    this.isManagePosts = this.user.permissions?.includes(Permissions.ManagePosts) ?? false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['post']) {
      this.allowed_privileges = this.post?.allowed_privileges ?? '';
      if (changes['post'].currentValue?.post_content?.length) {
        this.getData(changes['post'].currentValue);
        if (this.post) {
          this.setMetaData(this.post!);
          this.preparePostForView();
        }
      }
    }
  }

  private preparePostForView() {
    this.post!.post_content = postHelpers.markCompletedTasks(
      this.post?.post_content || [],
      this.post,
    );
    this.post!.post_content = postHelpers.replaceNewlinesWithBreaks(this.post?.post_content || []);
    this.post!.content = postHelpers.replaceNewlinesInString(this.post!.content);
    this.isPostLoading = false;
  }

  private async getSurvey(): Promise<void> {
    if (!this.postId) return;
    if (this.post && this.post.form_id) {
      const form = await lastValueFrom(this.surveyService.getById(this.post.form_id!));
      this.post.form = form.result;
      this.getData(this.post);
      this.preparePostForView();
    } else {
      this.postChanged = false;
    }
  }

  private async getData(post: PostResult): Promise<void> {
    for (const content of post.post_content as PostContent[]) {
      this.preparingSafeVideoUrls(content.fields);
      this.preparingRelatedPosts(content.fields);
      this.preparingCategories(content.fields);
      this.preparingMediaField(content.fields).then(() => {
        this.postChanged = false;
      });
    }
  }

  private preparingCategories(fields: PostContentField[]): void {
    fields
      .filter((field: any) => field.type === 'tags')
      .map((categories: any) => {
        if (categories.value) {
          categories.value = categories.value.filter((category: any) => {
            // Adding children to parents
            if (!category.parent_id) {
              category.children = categories.value.filter(
                (child: any) => child.parent_id === category.id,
              );
              return category;
            }
            // Removing children with parents from values to avoid repetition
            if (
              category.parent_id &&
              !categories.value.filter((parent: any) => category.parent_id === parent.id).length
            ) {
              return category;
            }
          });
        }
        return categories;
      });
    //----------------------
    // this.postChanged = false;
    //----------------------
  }

  private preparingRelatedPosts(fields: PostContentField[]): void {
    fields
      .filter((field: any) => field.type === 'relation')
      .map(async (relativeField) => {
        if (relativeField.value?.value) {
          const url = `${window.location.origin}/feed/${relativeField.value.value}/view?mode=ID`;
          const relative = await this.getPostInformation(relativeField.value.value);
          if (relative) {
            const { title } = relative;
            relativeField.value.postTitle = title;
            relativeField.value.postUrl = url;
          }
        }
      });
  }

  private async preparingMediaField(fields: PostContentField[]): Promise<void> {
    fields
      .filter((field: any) => field.type === 'media')
      .map(async (mediaField) => {
        if (Array.isArray(mediaField.value)) {
          const mediaFiles: MediaFile[] = [];
          for await (const mediaValue of mediaField.value) {
            if (mediaValue.value) {
              const media = await lastValueFrom(this.mediaService.getById(mediaValue.value));
              const mediaFile: MediaFile = new MediaFile(
                media.result,
                media.result.original_file_url,
              );
              mediaFile.id = mediaValue.id;
              mediaFile.value = media.result.id;
              mediaFile.caption = media.result.caption;
              mediaFile.status = MediaFileStatus.READY;
              mediaFiles.push(mediaFile);
            }
          }
          mediaField.value = mediaFiles;
        } else if (mediaField.value?.value) {
          const media = await this.getPostMedia(mediaField.value.value);
          mediaField.value.preview = media.result.original_file_url;
          mediaField.value.caption = media.result.caption;
          mediaField.value.mimeType = media.result.mime;
          mediaField.value.size = media.result.original_file_size;
        }
      });
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
  private async getPostInformation(postId: number): Promise<any> {
    try {
      this.isPostLoading = true;
      return await lastValueFrom(this.postsService.getById(postId));
    } catch (err: any) {
      this.isPostLoading = false;
      return;
    }
  }
  private async getPostMedia(mediaId: string): Promise<any> {
    try {
      return await lastValueFrom(this.mediaService.getById(mediaId));
    } catch (err) {
      console.error(err);
      return;
    }
  }

  getVideoUrlForField(field: any): any {
    const videoUrlObj = this.videoUrls.find((urlObj) => urlObj.rawUrl.includes(field.value.value));
    return videoUrlObj ? videoUrlObj.safeUrl : null;
  }

  private generateSecurityTrustResourceUrl(unsafeUrl: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
  }

  public isParentCategory(
    categories: CategoryInterface[] | undefined,
    category_id: number,
  ): boolean {
    return !!categories?.find((category: CategoryInterface) => category.parent_id === category_id);
  }

  private setMetaData(post: PostResult) {
    this.metaService.updateTag({ property: 'og:title', content: post.title });
    this.metaService.updateTag({
      property: 'og:description',
      content: post.content,
    });
  }

  public statusChangedHandle(): void {
    this.statusChanged.emit();
    this.eventBusService.next({
      type: EventType.UpdatedPost,
      payload: this.post,
    });
  }

  public refreshPost(): void {
    this.refresh.emit();
    this.eventBusService.next({
      type: EventType.RefreshPosts,
      payload: {},
    });
  }
  public deletedHandle(): void {
    this.eventBusService.next({
      type: EventType.DeletedPost,
      payload: this.post,
    });
  }

  ngOnDestroy() {
    this.metaService.updateTag({
      property: 'og:title',
      content: sessionStorage.getItem('ogTitle')!,
    });
    this.metaService.removeTag("property='og:description'");
  }

  public getDate(value: any, format: string): string {
    return dateHelper.getDateWithTz(value, format);
  }
}
