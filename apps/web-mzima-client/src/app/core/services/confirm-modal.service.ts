import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogData, ConfirmModalComponent } from '../../shared/components';

interface ConfirmModalProps {
  title?: string;
  description?: string;
  buttonSuccess?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmModalService {
  constructor(private dialog: MatDialog) {}

  public async open(params: ConfirmModalProps): Promise<boolean> {
    const data: ConfirmDialogData = {
      title: params.title,
      description: params.description,
      buttonSuccess: params.buttonSuccess,
      confirmButtonText: params.confirmButtonText,
      cancelButtonText: params.cancelButtonText,
    };
    return new Promise<boolean>((resolve, reject) => {
      const dialogRef = this.dialog.open(ConfirmModalComponent, {
        data,
        width: '100%',
        maxWidth: '574px',
        minWidth: '300px',
        id: 'confirm-modal',
        panelClass: ['modal', 'confirm-modal'],
      });

      dialogRef.afterClosed().subscribe({
        next: (response: boolean) => {
          resolve(response);
        },
        error: () => {
          reject();
        },
      });
    });
  }
}
