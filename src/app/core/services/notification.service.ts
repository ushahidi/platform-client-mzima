import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(public snackBar: MatSnackBar) {}

  showError(message: string) {
    this.snackBar.open(message, 'Close', { panelClass: ['error'] });
  }
}
