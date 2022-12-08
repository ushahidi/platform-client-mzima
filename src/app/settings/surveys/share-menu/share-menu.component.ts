import { Component, Input, OnInit } from '@angular/core';
import { ClipboardService } from 'src/app/core/services/clipboard.service';

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
  public embed = `<iframe width="560" height="315" src="https://mzima.staging.ush.zone/posts/create/1" frameborder="0" allowfullscreen></iframe>`;

  constructor(private clipboard: ClipboardService) {}

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

  public copyToClipboard(str: string): void {
    this.clipboard.copy(str);
  }
}
