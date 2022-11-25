import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { mergeMap, Observable } from 'rxjs';
import { CONST } from '@constants';
import { EnvService, ResourceService, SessionService } from '@services';
import { UsersService } from './users.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends ResourceService<any> {
  constructor(
    protected override httpClient: HttpClient,
    protected override env: EnvService,
    private sessionService: SessionService,
    private userService: UsersService,
  ) {
    super(httpClient, env);
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
      client_id: this.env.environment.oauth_client_id,
      client_secret: this.env.environment.oauth_client_secret,
      scope: CONST.CLAIMED_USER_SCOPES.join(' '),
    };
    return super.post(payload).pipe(
      mergeMap(async (authResponse) => {
        const accessToken = authResponse.access_token;

        if (authResponse.expires_in) {
          this.sessionService.setSessionData({
            accessToken,
            accessTokenExpires: Math.floor(Date.now() / 1000) + authResponse.expires_in,
            grantType: 'password',
            tokenType: authResponse.token_type,
          });
        } else if (authResponse.expires) {
          this.sessionService.setSessionData({
            accessToken,
            accessTokenExpires: authResponse.expires,
            grantType: 'password',
            tokenType: authResponse.token_type,
          });
        }

        return this.userService.getCurrentUser().subscribe({
          next: (userData) => {
            this.userService.dispatchUserEvents(userData);
          },
        });
      }),
    );
  }

  signup(payload: { email: string; password: string; realname: string }) {
    return this.httpClient.post(
      `${this.env.environment.backend_url}${this.env.environment.api_v3}register`,
      payload,
    );
  }

  public logout() {
    this.sessionService.clearSessionData();
    this.sessionService.clearUserData();
  }
}
