import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { mergeMap, Observable } from 'rxjs';
import { CONST } from '@constants';
import { ResourceService, SessionService } from '@services';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends ResourceService<any> {
  constructor(
    protected override httpClient: HttpClient,
    private sessionService: SessionService,
    private userService: UserService,
  ) {
    super(httpClient);
  }

  getApiVersions(): string {
    return '';
  }

  getResourceUrl(): string {
    return 'oauth/token';
  }

  login(username: string, password: string): Observable<any> {
    const payload = {
      username: username,
      password: password,
      grant_type: 'password',
      client_id: CONST.OAUTH_CLIENT_ID,
      client_secret: CONST.OAUTH_CLIENT_SECRET,
      scope: CONST.CLAIMED_USER_SCOPES.join(' '),
    };
    return super.post(payload).pipe(
      mergeMap((authResponse) => {
        const accessToken = authResponse.access_token;

        if (authResponse.expires_in) {
          this.sessionService.setSessionData({
            accessToken,
            accessTokenExpires: Math.floor(Date.now() / 1000) + authResponse.expires_in,
            grantType: 'password',
          });
        } else if (authResponse.expires) {
          this.sessionService.setSessionData({
            accessToken,
            accessTokenExpires: authResponse.expires,
            grantType: 'password',
          });
        }

        return this.userService.getCurrentUser();
      }),
    );
  }

  public logout() {
    this.sessionService.clearSessionData();
    this.sessionService.clearUserData();
  }
}
