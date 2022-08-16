import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  logError(error: Error | HttpErrorResponse) {
    if (error instanceof HttpErrorResponse) {
      console.error(error);
    } else {
      console.error(error);
    }
  }
}
