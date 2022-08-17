import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { SessionService } from '../services';
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private session: SessionService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authToken = this.session.currentAuthToken;
    if (authToken) {
      req = req.clone({
        setHeaders: {
          Authorization: 'Bearer ' + authToken,
        },
      });
    }

    return next.handle(req);
  }
}
