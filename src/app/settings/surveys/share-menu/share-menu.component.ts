import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-share-menu',
  templateUrl: './share-menu.component.html',
  styleUrls: ['./share-menu.component.scss'],
})
export class ShareMenuComponent implements OnInit {
  @Input() postId: string;
  @Input() surveyId: string;
  shareUrl: string = '';
  shareUrlEncoded: any;
  hasPermission = true;

  ngOnInit(): void {
    if (this.postId) {
      this.shareUrl = `${window.location.origin}/posts/${this.postId}`;
    }

    if (this.surveyId) {
      this.shareUrl = `${window.location.origin}/posts/create/${this.surveyId}`;
    }

    this.shareUrlEncoded = encodeURIComponent(this.shareUrl);
  }

  isExportable() {
    return true;
  }
}
