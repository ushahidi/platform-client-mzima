import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments';
import { Observable, tap } from 'rxjs';
import { ResourceService } from './resource.service';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends ResourceService<any> {
  constructor(protected override httpClient: HttpClient, private sessionService: SessionService) {
    super(httpClient);
  }

  getApiVersions(): string {
    return environment.api_v3;
  }

  getResourceUrl(): string {
    return 'users';
  }

  getCurrentUser(): Observable<any> {
    return super.get('me').pipe(
      tap((userData) => {
        this.sessionService.setCurrentUser({
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
