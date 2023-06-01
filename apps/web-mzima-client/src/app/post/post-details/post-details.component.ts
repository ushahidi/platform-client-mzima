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
import { DomSanitizer, Meta, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { preparingVideoUrl } from '../../core/helpers/validators';
import { CollectionsModalComponent } from '../../shared/components';
import {
  MediaService,
  CategoryInterface,
  PostResult,
  PostContent,
  PostsService,
  PostContentField,
} from '@mzima-client/sdk';

@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.scss'],
})
export class PostDetailsComponent implements OnChanges, OnDestroy {
  @Input() post?: PostResult;
  @Input() feedView: boolean;
  @Input() userId?: number | string;
  @Input() color?: string;
  @Input() twitterId?: string;
  @Output() edit = new EventEmitter();
  @Output() refresh = new EventEmitter();
  @Output() statusChanged = new EventEmitter();
  public media?: any;
  public allowed_privileges: string | string[];
  public postId: string;
  public videoUrl: SafeResourceUrl;

  constructor(
    private dialog: MatDialog,
    private translate: TranslateService,
    private mediaService: MediaService,
    private metaService: Meta,
    private route: ActivatedRoute,
    private postsService: PostsService,
    private sanitizer: DomSanitizer,
  ) {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.post = undefined;

        this.allowed_privileges = localStorage.getItem('USH_allowed_privileges') ?? '';

        this.postId = params['id'];

        this.getPost();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['post']) {
      this.allowed_privileges = this.post?.allowed_privileges ?? '';
      if (changes['post'].currentValue?.post_content?.length) {
        this.setMetaData(this.post!);
        this.preparingMediaField(changes['post'].currentValue.post_content[0].fields);
        this.preparingSafeVideoUrl(changes['post'].currentValue.post_content[0].fields);
      }
    }
  }

  private getPostMedia(mediaField: any): void {
    this.mediaService.getById(mediaField.value.value).subscribe({
      next: (media) => {
        this.media = media;
      },
    });
  }

  private getPost(): void {
    if (!this.postId) return;
    this.postsService.getById(this.postId).subscribe({
      next: (post: PostResult) => {
        this.post = post;
        this.preparingMediaField((this.post.post_content as PostContent[])[0].fields);
        this.preparingSafeVideoUrl((this.post.post_content as PostContent[])[0].fields);
      },
    });
  }

  private preparingMediaField(fields: PostContentField[]) {
    const mediaField = fields.find((field: any) => field.type === 'media');
    if (mediaField && mediaField.value?.value) {
      this.getPostMedia(mediaField);
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

  public isParentCategory(
    categories: CategoryInterface[] | undefined,
    category_id: number,
  ): boolean {
    return !!categories?.find((category: CategoryInterface) => category.parent_id === category_id);
  }

  public addToCollection(): void {
    this.dialog.open(CollectionsModalComponent, {
      width: '100%',
      maxWidth: 480,
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'modal',
      data: {
        title: this.translate.instant('app.edit_collection'),
      },
    });
  }

  private setMetaData(post: PostResult) {
    this.metaService.updateTag({ property: 'og:title', content: post.title });
    this.metaService.updateTag({
      property: 'og:description',
      content: post.content,
    });
  }

  public statusChangedHandle(): void {
    this.getPost();
    this.statusChanged.emit();
  }

  ngOnDestroy() {
    this.metaService.updateTag({
      property: 'og:title',
      content: sessionStorage.getItem('ogTitle')!,
    });
    this.metaService.removeTag("property='og:description'");
  }
}
