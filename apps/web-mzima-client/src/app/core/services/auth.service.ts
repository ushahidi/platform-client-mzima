import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { mergeMap, Observable } from 'rxjs';
import { CONST } from '@constants';
import { UsersService } from '@mzima-client/sdk';
import { ResourceService } from './resource.service';
import { EnvService } from './env.service';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends ResourceService<any> {
  constructor(
    protected override httpClient: HttpClient,
    protected override env: EnvService,
    private sessionService: SessionService,
    private userService: UsersService,
    private translate: TranslateService,
    private router: Router,
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
          next: (userData: any) => {
            const { result } = userData;
            this.setCurrentUserToSession(result);
            this.userService.dispatchUserEvents({ result });
          },
        });
      }),
    );
  }

  private setCurrentUserToSession(user: any) {
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

  restorePassword(payload: { token: string; password: string }) {
    return this.httpClient.post(
      `${this.env.environment.backend_url}${this.env.environment.api_v3}passwordreset/confirm`,
      payload,
    );
  }

  public logout() {
    this.sessionService.clearSessionData();
    this.sessionService.clearUserData();
    this.router.navigate(['/map']);
  }

  public getControlError(form: FormGroup, field: string, errorCodes: string[]) {
    for (const errorCode of errorCodes) {
      if (form.controls[field].hasError(errorCode)) {
        return this.translate.instant(`user.valid.${field}.${errorCode}`);
      }
    }
  }
}
