import { Component, Input, OnInit } from '@angular/core';
import { PostPropertiesInterface, PostResult } from '@mzima-client/sdk';

@Component({
  selector: 'app-post-metadata',
  templateUrl: './post-metadata.component.html',
  styleUrls: ['./post-metadata.component.scss'],
})
export class PostMetadataComponent implements OnInit {
  @Input() post: PostResult | PostPropertiesInterface;
  author: string;

  ngOnInit(): void {
    this.getUsername();
  }

  private getUsername(): void {
    const authorNameOrContact =
      this.post.user?.realname || this.post.contact?.contact || this.post.author_realname;

    this.author = authorNameOrContact || 'Anonymous';
  }
}
