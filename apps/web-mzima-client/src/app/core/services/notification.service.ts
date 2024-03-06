import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { SnackbarComponent, SnackbarData } from '../../shared/components';

export interface SnackbarOptions extends MatSnackBarConfig {
  wide?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(public snackBar: MatSnackBar) {}

  showError(message: string) {
    this.snackBar.open(message, 'Close', { panelClass: ['error'], duration: 3000 });
  }

  showSnackbar(data?: SnackbarData, options?: SnackbarOptions) {
    const panelClass = ['custom-snackbar'];
    options?.wide ? panelClass.push('custom-snackbar--wide') : null;
    this.snackBar.openFromComponent(SnackbarComponent, {
      ...options,
      panelClass,
      data,
    });
  }
  // Add the showSuccess method
  showSuccess(message: string) {
    this.snackBar.open(message, 'Close', { panelClass: ['success'], duration: 3000 });
  }
}
