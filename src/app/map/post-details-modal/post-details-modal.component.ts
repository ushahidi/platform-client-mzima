import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-post-details-modal',
  templateUrl: './post-details-modal.component.html',
  styleUrls: ['./post-details-modal.component.scss'],
})
export class PostDetailsModalComponent {
  public post: any;
  public color: string;
  public twitterId: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.post = data.post;
    this.color = data.color;
    this.twitterId = data.twitterId;
  }
}
