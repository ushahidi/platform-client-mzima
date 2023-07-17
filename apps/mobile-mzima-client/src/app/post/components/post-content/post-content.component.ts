import { Component, Input } from '@angular/core';
import { CategoryInterface, PostContent } from '@mzima-client/sdk';

@Component({
  selector: 'app-post-content',
  templateUrl: './post-content.component.html',
  styleUrls: ['./post-content.component.scss'],
})
export class PostContentComponent {
  @Input() postContent: PostContent[];
  @Input() categories: CategoryInterface[];
  @Input() isConnection: boolean;
  @Input() videoUrls: any[] = [];
  @Input() isMediaLoading: boolean;

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
}
