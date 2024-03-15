import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
// import { SnackbarComponent, SnackbarData } from '../../shared/components';

export interface SnackbarOptions extends MatSnackBarConfig {
  wide?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(public snackBar: MatSnackBar) {}

  showError(message: string) {
    this.snackBar.open(message, 'Close', { panelClass: ['error'], duration: 3000 });
  }

  showMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      panelClass: ['success'],
      duration: 2000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
    });
  }
}
