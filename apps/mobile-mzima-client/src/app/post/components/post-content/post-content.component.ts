import { Component, Input } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-post-content',
  templateUrl: './post-content.component.html',
  styleUrls: ['./post-content.component.scss'],
})
export class PostContentComponent {
  @Input() postContent: any;
  @Input() categories: any;
  @Input() isConnection: boolean;
  @Input() videoUrl: SafeResourceUrl;
  @Input() isMediaLoading: boolean;
}
