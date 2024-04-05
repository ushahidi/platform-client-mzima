import { Component, Input } from '@angular/core';
import { CategoryInterface, PostContent, MediaService } from '@mzima-client/sdk';
import { dateHelper } from '@helpers';

@Component({
  selector: 'app-post-content',
  templateUrl: './post-content.component.html',
  styleUrls: ['./post-content.component.scss'],
})
export class PostContentComponent {
  @Input() postContent: PostContent[];
  @Input() userId: number;
  @Input() postUserId: number;
  @Input() postStatus: string;
  @Input() categories: CategoryInterface[];
  @Input() isConnection: boolean;
  @Input() videoUrls: any[] = [];
  @Input() isMediaLoading: boolean;
  @Input() isManagePosts: boolean;

  public backendUrl: string;

  constructor(private mediaService: MediaService) {
    this.backendUrl = this.mediaService.backendUrl;
  }

  public isParentCategory(
    categories: CategoryInterface[] | undefined,
    category_id: number,
  ): boolean {
    return !!categories?.find((category: CategoryInterface) => category.parent_id === category_id);
  }

  public getVideoUrlForField(field: any): any {
    const videoUrlObj = this.videoUrls.find((urlObj) => urlObj.rawUrl.includes(field.value.value));
    return videoUrlObj ? videoUrlObj.safeUrl : null;
  }

  public getDate(value: any, format: string): string {
    return dateHelper.getDateWithTz(value, format);
  }
}
