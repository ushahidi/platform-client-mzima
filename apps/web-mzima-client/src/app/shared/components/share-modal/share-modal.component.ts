import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

interface DataShareModal {
  postId: number;
  title: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-share-modal',
  templateUrl: './share-modal.component.html',
  styleUrls: ['./share-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareModalComponent implements OnInit {
  public address: string;
  public htmlEmbed: string;
  public copySuccess = false;
  public width = 560;
  public height = 315;
  public title: string;
  public label: string;
  public description: string;
  public sliceDescription = 100;
  private postId: number;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DataShareModal, private clipboard: Clipboard) {
    this.postId = data?.postId;
    this.title = data?.title;
    this.label = data?.label;
    this.description = this.trimText(data?.description, this.sliceDescription);
  }

  ngOnInit(): void {
    this.address = this.postId
      ? `${window.location.origin}/feed/${this.postId}/view?mode=ID`
      : window.location.href;
    this.htmlEmbed = `<iframe width="${this.width}" height="${this.height}" src="${this.address}" frameborder="0" allowfullscreen></iframe>`;
  }

  public changeAddress(e: Event) {
    const { value } = e.target as HTMLInputElement;
    this.htmlEmbed = `<iframe width="${this.width}" height="${this.height}" src="${value}" frameborder="0" allowfullscreen></iframe>`;
  }

  public copyToClipboard() {
    this.copySuccess = this.clipboard.copy(this.htmlEmbed);
    setTimeout(() => (this.copySuccess = !this.copySuccess), 2000);
  }

  private trimText(text: string, length: number) {
    return text.length > length ? `${text.substring(0, length)}...` : text;
  }
}
