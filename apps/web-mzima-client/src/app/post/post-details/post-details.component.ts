import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Permissions } from '@enums';
import {
  CategoryInterface,
  MediaService,
  PostContent,
  PostContentField,
  postHelpers,
  PostResult,
  PostsService,
  SurveysService,
} from '@mzima-client/sdk';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';
import { BaseComponent } from '../../base.component';
import { preparingVideoUrl } from '../../core/helpers/validators';
import { dateHelper } from '@helpers';
import { BreakpointService, EventBusService, EventType, SessionService } from '@services';

@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.scss'],
})
export class PostDetailsComponent extends BaseComponent implements OnChanges, OnDestroy {
  @Input() post: PostResult;
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
  public postNotFound: boolean = false;

  constructor(
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private mediaService: MediaService,
    private metaService: Meta,
    private route: ActivatedRoute,
    private postsService: PostsService,
    private surveyService: SurveysService,
    private sanitizer: DomSanitizer,
    private eventBusService: EventBusService,
  ) {
    super(sessionService, breakpointService);
    this.getUserData();
    this.checkPermission();
    this.userId = Number(this.user.userId);

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.allowed_privileges = localStorage.getItem('USH_allowed_privileges') ?? '';

        this.postId = Number(params['id']);

        this.getPost(this.postId);
      }
    });
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
  }

  private async getPost(id: number): Promise<void> {
    if (!this.postId) return;
    this.post = await this.getPostInformation(id);
    if (this.post) {
      this.surveyService.getById(this.post.form_id!).subscribe((form) => {
        this.post!.form = form.result;
      });
      this.isPostLoading = false;
      this.getData(this.post);
      this.preparePostForView();
    }
  }

  private getData(post: PostResult): void {
    for (const content of post.post_content as PostContent[]) {
      this.preparingMediaField(content.fields);
      this.preparingSafeVideoUrls(content.fields);
      this.preparingRelatedPosts(content.fields);
      this.preparingCategories(content.fields);
    }
  }

  private preparingCategories(fields: PostContentField[]): void {
    fields
      .filter((field: any) => field.type === 'tags')
      .map((categories: any) => {
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
        return categories;
      });
  }

  private preparingRelatedPosts(fields: PostContentField[]): void {
    fields
      .filter((field: any) => field.type === 'relation')
      .map(async (relativeField) => {
        if (relativeField.value?.value) {
          const url = `${window.location.origin}/feed/${relativeField.value.value}/view?mode=POST`;
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
        if (mediaField.value?.value) {
          const media = await this.getPostMedia(mediaField.value.value);
          mediaField.value.mediaSrc = media.result.original_file_url;
          mediaField.value.mediaCaption = media.result.caption;
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
      console.log(err);
      if (err.status === 404) this.postNotFound = true;
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
    this.getPost(this.postId);
    this.statusChanged.emit();
    this.eventBusService.next({
      type: EventType.UpdatedPost,
      payload: this.post,
    });
  }

  public deletedHandle(): void {
    this.getPost(this.postId);
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
