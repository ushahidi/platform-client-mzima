import { Component, Input } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
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
  @Input() videoUrl: SafeResourceUrl;
  @Input() isMediaLoading: boolean;

  public isParentCategory(
    categories: CategoryInterface[] | undefined,
    category_id: number,
  ): boolean {
    return !!categories?.find((category: CategoryInterface) => category.parent_id === category_id);
  }
}
