import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { mergeMap, tap } from 'rxjs';
import { CONST } from '../core/constants';
import { SessionService } from '../core/services';

interface AuthResponse {
  access_token: string;
  expires_in?: number;
  expires?: number;
  refresh_token: string;
  token_type: string;
}

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private sessionService: SessionService) {}

  login(username: string, password: string) {
    const payload = {
      username: username,
      password: password,
      grant_type: 'password',
      client_id: CONST.OAUTH_CLIENT_ID,
      client_secret: CONST.OAUTH_CLIENT_SECRET,
      scope: CONST.CLAIMED_USER_SCOPES.join(' '),
    };
    // .subscribe((res: any) => {
    //   localStorage.setItem('access_token', res.token);
    //   this.getUserProfile(res._id).subscribe((res) => {
    //     this.currentUser = res;
    //     this.router.navigate(['user-profile/' + res.msg._id]);
    //   });
    // });
    return this.http
      .post<AuthResponse>(`${CONST.BACKEND_URL}oauth/token`, payload, httpOptions)
      .pipe(
        mergeMap((authResponse) => {
          const accessToken = authResponse.access_token;
          this.sessionService.setSessionDataEntry('accessToken', accessToken);
          if (authResponse.expires_in) {
            this.sessionService.setSessionDataEntry(
              'accessTokenExpires',
              Math.floor(Date.now() / 1000) + authResponse.expires_in,
            );
          } else if (authResponse.expires) {
            this.sessionService.setSessionDataEntry('accessTokenExpires', authResponse.expires);
          }
          this.sessionService.setSessionDataEntry('grantType', 'password');

          return this.getCurrentUser();
        }),
      );
  }

  getCurrentUser() {
    return this.http.get<any>(`${CONST.API_URL}/users/me`).pipe(
      tap((userData) => {
        this.sessionService.setSessionDataEntries({
          userId: userData.id,
          realname: userData.realname,
          email: userData.email,
          role: userData.role,
          permissions: userData.permissions,
          gravatar: userData.gravatar,
          language: userData.language,
        });
        // FIXME?! window.dispatchEvent
        window.dispatchEvent(new CustomEvent('ush:analytics:refreshUserProperties'));
        window.dispatchEvent(
          new CustomEvent('datalayer:custom-event', {
            detail: {
              event: 'user logged in',
              event_type: 'user_interaction',
              user_role: userData.role === 'admin' ? 'admin' : 'member',
            },
          }),
        );
      }),
    );
  }
}
