import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CategoryInterface, PostResult } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmModalService, MediaService, PostsV5Service } from '@services';
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
  public media?: any;

  constructor(
    private dialog: MatDialog,
    private translate: TranslateService,
    private confirmModalService: ConfirmModalService,
    private mediaService: MediaService,
    private metaService: Meta,
    private route: ActivatedRoute,
    private postsV5Service: PostsV5Service,
  ) {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.post = undefined;

        this.postsV5Service.getById(params['id']).subscribe({
          next: (postV5: PostResult) => {
            this.post = postV5;
          },
        });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['post']) {
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

  public async deletePost(): Promise<void> {
    const confirmed = await this.confirmModalService.open({
      title: this.translate.instant('notify.post.destroy_confirm'),
      description: this.translate.instant('notify.default.proceed_warning'),
    });
    if (!confirmed) return;
    console.log('FIXME: delete post');
  }

  private setMetaData(post: PostResult) {
    this.metaService.updateTag({ property: 'og:title', content: post.title });
    this.metaService.updateTag({ property: 'og:description', content: post.content });
  }

  ngOnDestroy() {
    this.metaService.updateTag({
      property: 'og:title',
      content: sessionStorage.getItem('ogTitle')!,
    });
    this.metaService.removeTag("property='og:description'");
  }
}
