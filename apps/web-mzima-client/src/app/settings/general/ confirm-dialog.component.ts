import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <h2 mat-dialog-title style="font-size: 24px; font-weight: bold;">
      The data has not been saved
    </h2>
    <div class="dialog-content" style="margin-bottom: 20px; font-size: 16px;">
      This action cannot be undone. Please proceed with caution.
    </div>
    <div class="dialog-actions" style="display: flex; justify-content: flex-end;">
      <button
        class="dialog-button cancel-button"
        style="background-color: white; color: #333; padding: 12px 24px;  width:25%; margin-right: 10px; border: 1px solid gray; border-radius: 3px; font-size: 14px; font-weight: semi-bold;"
        (click)="onCancel()"
      >
        Cancel
      </button>
      <button
        class="dialog-button confirm-button"
        style="background-color: orange; color: #333; width: 25%; padding: 12px 24px; margin-left: 10px; border: none; border-radius: 3px; font-size: 14px; font-weight: semi-bold;"
        (click)="onConfirm()"
      >
        OK
      </button>
    </div>
  `,
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
  ) {}

  get title(): string {
    return this.data.title || 'Confirmation';
  }

  get message(): string {
    return this.data.message || 'Are you sure you want to discard the changes?';
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

export interface ConfirmDialogData {
  title?: string;
  message?: string;
}
