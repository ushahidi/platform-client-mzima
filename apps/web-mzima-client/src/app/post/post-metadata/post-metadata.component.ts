import { Component, Input, OnInit } from '@angular/core';
import { PostPropertiesInterface, PostResult } from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { EventBusService, EventType } from '@services';

@UntilDestroy()
@Component({
  selector: 'app-post-metadata',
  templateUrl: './post-metadata.component.html',
  styleUrls: ['./post-metadata.component.scss'],
})
export class PostMetadataComponent implements OnInit {
  @Input() post: PostResult | PostPropertiesInterface;
  author: string;

  constructor(private eventBusService: EventBusService) {}

  ngOnInit(): void {
    this.getUsername();
    this.eventBusService
      .on(EventType.StatusChange)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (post) => {
          if (post.id === this.post.id) this.post = post;
        },
      });
  }

  private getUsername(): void {
    const authorNameOrContact =
      this.post.user?.realname || this.post.contact?.contact || this.post.author_realname;

    this.author = authorNameOrContact || 'Anonymous';
  }
}
