import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-post-head',
  templateUrl: './post-head.component.html',
  styleUrls: ['./post-head.component.scss'],
})
export class PostHeadComponent {
  @Input() public post: any;
}
