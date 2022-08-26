import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  ConfirmDialogData,
  ConfirmModalComponent,
} from 'src/app/shared/components/confirm-modal/confirm-modal.component';

interface ConfirmModalProps {
  title?: string;
  description?: string;
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
    };
    return new Promise<boolean>((resolve, reject) => {
      const dialogRef = this.dialog.open(ConfirmModalComponent, {
        data,
        width: '100%',
        maxWidth: '564px',
        minWidth: '300px',
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
