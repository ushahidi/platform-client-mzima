import { Component, Input, OnInit } from '@angular/core';
import { PostPropertiesInterface, PostResult } from '@models';

@Component({
  selector: 'app-post-metadata',
  templateUrl: './post-metadata.component.html',
  styleUrls: ['./post-metadata.component.scss'],
})
export class PostMetadataComponent implements OnInit {
  @Input() post: PostResult | PostPropertiesInterface;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function
  constructor() {}

  ngOnInit(): void {
    console.log('Post metadata component!');
  }
}
