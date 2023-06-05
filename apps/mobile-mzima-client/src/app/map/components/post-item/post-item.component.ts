import { Component, Input, OnInit } from '@angular/core';
import { MediaService, PostResult } from '@mzima-client/sdk';

@Component({
  selector: 'app-post-item',
  templateUrl: './post-item.component.html',
  styleUrls: ['./post-item.component.scss'],
})
export class PostItemComponent implements OnInit {
  @Input() public post: PostResult;
  public media: any;
  public mediaId?: number;
  public isMediaLoading: boolean;

  constructor(private mediaService: MediaService) {}

  ngOnInit(): void {
    console.log('post: ', this.post);

    this.mediaId = this.post.post_content
      ?.flatMap((c) => c.fields)
      .find((f) => f.input === 'upload')?.value?.value;

    if (this.mediaId) {
      this.isMediaLoading = true;
      this.mediaService.getById(String(this.mediaId)).subscribe({
        next: (media) => {
          this.isMediaLoading = false;
          this.media = media;
        },
        error: () => {
          this.isMediaLoading = false;
        },
      });
    }
  }
}
