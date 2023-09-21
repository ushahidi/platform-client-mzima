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

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authToken = this.session.currentAuthToken;
    const authTokenType = this.session.currentAuthTokenType;
    if (authToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `${authTokenType} ${authToken}`,
        },
      });
    }

    return next.handle(req).pipe(
      catchError((response: HttpErrorResponse) => {
        if (response.status === 401) {
          this.authService.logout();
          this.router.navigate(['/']);
        }
        return throwError(() => response);
      }),
    );
  }
}
