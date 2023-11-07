import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-info-toast-details-modal',
  templateUrl: './info-toast-details-modal.component.html',
  styleUrls: ['./info-toast-details-modal.component.scss'],
})
export class InfoToastDetailsModalComponent {
  @Input() public isAdmin: boolean;
  public adminEmail = 'support@ushahidi.com';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private matDialogRef: MatDialogRef<InfoToastDetailsModalComponent>,
  ) {}

  public closeModal(): void {
    this.matDialogRef.close();
  }

  public openIntercom(): void {
    this.closeModal();
  }
}
