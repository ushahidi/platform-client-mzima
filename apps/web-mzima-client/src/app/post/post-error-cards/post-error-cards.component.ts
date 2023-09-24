import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-post-error-cards',
  templateUrl: './post-error-cards.component.html',
  styleUrls: ['./post-error-cards.component.scss'],
})
export class PostErrorCardsComponent implements OnChanges {
  @Input() isManagePosts: boolean;
  @Input() isPostLoading: boolean;
  @Input() postNotFound: boolean;
  is_ManagePosts: boolean;
  is_PostLoading: boolean;
  post_NotFound: boolean;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isPostLoading']) this.is_PostLoading = changes['isPostLoading']?.currentValue;
    if (changes['postNotFound']) this.post_NotFound = changes['postNotFound']?.currentValue;
    if (changes['isManagePosts']) this.is_ManagePosts = changes['isManagePosts']?.currentValue;
  }
}
