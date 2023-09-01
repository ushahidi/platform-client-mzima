import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-api-version-details-modal',
  templateUrl: './api-version-details-modal.component.html',
  styleUrls: ['./api-version-details-modal.component.scss'],
})
export class ApiVersionDetailsModalComponent {
  @Input() public isAdmin: boolean;
  public adminEmail = 'support@ushahidi.com';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private matDialogRef: MatDialogRef<ApiVersionDetailsModalComponent>,
  ) {}

  public closeModal(): void {
    this.matDialogRef.close();
  }

  public openIntercom(): void {
    this.closeModal();
  }
}
