import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class ErrorsHandlerService implements ErrorHandler {
  constructor(private injector: Injector, private translate: TranslateService) {}

  handleError(error: Error | HttpErrorResponse) {
    const translate = this.injector.get(TranslateService);

    if (!navigator.onLine) {
      this.showError(translate.instant('app.lost_internet_connection'));
    } else {
      if (error instanceof HttpErrorResponse) {
        if (!navigator.onLine) {
          this.showError(translate.instant('app.lost_internet_connection'));
        } else if (error.status === 401) {
          this.showError(translate.instant('app.you_are_not_authorized'));
        } else {
          console.error('Http Error: ' + error.message);
        }
      } else {
        console.error(`%cClient Error: %c${error?.message}`, 'color: #bada55', 'color: error');
      }
    }
  }

  private showError(message: string) {
    const snackBar = this.injector.get(MatSnackBar);
    snackBar.open(message, this.translate.instant('notify.snackbar.close'), {
      panelClass: ['error'],
      duration: 3000,
    });
  }
}
