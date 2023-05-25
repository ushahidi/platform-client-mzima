import { Component, Input } from '@angular/core';
import { PostResult } from '@mzima-client/sdk';

@Component({
  selector: 'app-post-item',
  templateUrl: './post-item.component.html',
  styleUrls: ['./post-item.component.scss'],
})
export class PostItemComponent {
  @Input() public post: PostResult;
}
