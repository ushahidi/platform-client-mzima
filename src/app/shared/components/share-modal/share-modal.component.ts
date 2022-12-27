import { Component, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-share-modal',
  templateUrl: './share-modal.component.html',
  styleUrls: ['./share-modal.component.scss'],
})
export class ShareModalComponent implements OnInit {
  public address: string;
  public htmlEmbed: string;
  private width = 560;
  private height = 315;
  public copySuccess = false;

  constructor(private clipboard: Clipboard) {}

  ngOnInit(): void {
    this.address = window.location.href;
    this.htmlEmbed = `<iframe width="${this.width}" height="${this.height}" src="${this.address}" frameborder="0" allowfullscreen></iframe>`;
  }

  public changeAddress(e: any) {
    this.htmlEmbed = `<iframe width="${this.width}" height="${this.height}" src="${e.target.value}" frameborder="0" allowfullscreen></iframe>`;
  }

  public copyToClipboard() {
    this.clipboard.copy(this.htmlEmbed);
    this.copySuccess = !this.copySuccess;
    setTimeout(() => (this.copySuccess = !this.copySuccess), 2000);
  }
}
