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
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CategoryInterface, PostResult } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { MediaService, PostsV5Service } from '@services';
import { CollectionsModalComponent } from 'src/app/shared/components';

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
  @Output() statusChanged = new EventEmitter();
  public media?: any;
  public allowed_privileges: string | string[];
  public postId: string;

  constructor(
    private dialog: MatDialog,
    private translate: TranslateService,
    private mediaService: MediaService,
    private metaService: Meta,
    private route: ActivatedRoute,
    private postsV5Service: PostsV5Service,
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
        const mediaField = changes['post'].currentValue.post_content[0].fields.find(
          (field: any) => field.type === 'media',
        );
        if (mediaField && mediaField.value?.value) {
          this.mediaService.getById(mediaField.value.value).subscribe({
            next: (media) => {
              this.media = media;
            },
          });
        }
      }
    }
  }

  private getPost(): void {
    if (!this.postId) return;
    this.postsV5Service.getById(this.postId).subscribe({
      next: (postV5: PostResult) => {
        this.post = postV5;
      },
    });
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
    this.metaService.updateTag({ property: 'og:description', content: post.content });
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
