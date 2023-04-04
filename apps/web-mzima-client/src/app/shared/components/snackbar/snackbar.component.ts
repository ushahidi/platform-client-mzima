import { Component, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

export interface SnackbarData {
  title?: string;
  message?: string;
  icon?: {
    name: string;
    color?: 'accent' | 'primary' | 'secondary' | 'gray' | 'success';
  };
  isLoading?: boolean;
  buttons: {
    text?: string;
    color?: 'danger' | 'primary' | 'secondary' | 'gray' | 'success';
    icon?: string;
    handler?: () => void;
  }[];
}

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss'],
})
export class SnackbarComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: SnackbarData,
    private _snackRef: MatSnackBarRef<SnackbarComponent>,
  ) {}

  public closeSnackbar(handler?: () => void): void {
    this._snackRef.dismiss();
    if (handler) {
      handler();
    }
  }
}
