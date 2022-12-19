import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LoggingService, NotificationService } from '@services';

@Injectable()
export class ErrorsHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: Error | HttpErrorResponse) {
    const notifier = this.injector.get(NotificationService);
    const logger = this.injector.get(LoggingService);
    const translate = this.injector.get(TranslateService);

    if (!navigator.onLine) {
      notifier.showError(translate.instant('app.lost_internet_connection'));
    } else {
      if (error instanceof HttpErrorResponse) {
        if (!navigator.onLine) {
          notifier.showError(translate.instant('app.lost_internet_connection'));
        } else if (error.status === 401) {
          notifier.showError(translate.instant('app.you_are_not_authorized'));
        } else {
          console.error('Http Error: ' + error.message);
        }
      } else {
        console.error('Client Error: ' + error.message);
      }
      logger.logError(error);
    }
  }
}
