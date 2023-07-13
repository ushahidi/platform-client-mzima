import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService, SessionService } from '@services';
import { catchError, throwError } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private session: SessionService,
    private router: Router,
    private authService: AuthService,
  ) {}

  isTokenlessRequest(req: HttpRequest<any>): boolean {
    if (req.method === 'GET') {
      if (req.url.includes('site') || req.url.includes('map') || req.url.includes('features'))
        return true;
    }
    return false;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authToken = this.session.currentAuthToken;
    const authTokenType = this.session.currentAuthTokenType;
    if (authToken && !this.isTokenlessRequest(req)) {
      req = req.clone({
        setHeaders: {
          Authorization: `${authTokenType} ${authToken}`,
        },
      });
    }

    return next.handle(req).pipe(
      catchError((response: HttpErrorResponse) => {
        if (response.status === 401) {
          console.log('status 401');
          this.authService.logout();
          this.router.navigate(['/']);
        }
        return throwError(() => response);
      }),
    );
  }
}
