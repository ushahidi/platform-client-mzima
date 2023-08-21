import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, mergeMap } from 'rxjs';
import { EnvService, SessionService } from '@services';
import { Router } from '@angular/router';
import {
  EnvLoader,
  generalHelpers,
  ResourceService,
  UserInterface,
  UsersService,
} from '@mzima-client/sdk';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends ResourceService<any> {
  constructor(
    protected override httpClient: HttpClient,
    protected envLoader: EnvLoader,
    protected env: EnvService,
    private sessionService: SessionService,
    private router: Router,
    private userService: UsersService,
  ) {
    super(httpClient, envLoader);
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
      scope: generalHelpers.CONST.CLAIMED_USER_SCOPES.join(' '),
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
            const { result } = userData;
            this.setCurrentUserToSession(result);
            this.userService.dispatchUserEvents({ result });
          },
        });
      }),
    );
  }

  public setCurrentUserToSession(user: UserInterface) {
    this.sessionService.setCurrentUser({
      userId: user.id,
      realname: user.realname,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      allowed_privileges: user.allowed_privileges,
      gravatar: user.gravatar,
      language: user.language,
    });
  }

  signup(payload: { email: string; password: string; realname: string }) {
    return this.httpClient.post(
      `${this.env.environment.backend_url}${this.env.environment.api_v3}register`,
      payload,
    );
  }

  resetPassword(payload: { email: string }) {
    return this.httpClient.post(
      `${this.env.environment.backend_url}${this.env.environment.api_v3}passwordreset`,
      payload,
    );
  }

  public logout() {
    console.log('logout');
    this.sessionService.clearSessionData();
    this.sessionService.clearUserData();
  }
}
