import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { SnackbarComponent, SnackbarData } from '../../shared/components';
import { TranslateService } from '@ngx-translate/core';

export interface SnackbarOptions extends MatSnackBarConfig {
  wide?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(public snackBar: MatSnackBar, private translate: TranslateService) {}

  showError(message: string) {
    this.snackBar.open(message, this.translate.instant('notify.snackbar.close'), {
      panelClass: ['error'],
      duration: 3000,
    });
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
}
