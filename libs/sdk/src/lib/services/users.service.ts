import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { apiHelpers } from '../helpers';
import { EnvLoader } from '../loader';
import { GeoJsonFilter, UserInterfaceResponse, UserResponse } from '../models';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService extends ResourceService<any> {
  private totalUsers = new Subject<number>();
  public totalUsers$ = this.totalUsers.asObservable();

  constructor(
    protected override httpClient: HttpClient,
    protected override currentLoader: EnvLoader,
  ) {
    super(httpClient, currentLoader);
  }

  getApiVersions(): string {
    return apiHelpers.API_V_5;
  }

  getResourceUrl(): string {
    return 'users';
  }

  getCurrentUser(): Observable<UserInterfaceResponse> {
    return super.get('me');
  }

  public dispatchUserEvents(userData: any): void {
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
  }

  updateCurrentUser(data: any): Observable<UserInterfaceResponse> {
    return super.update('me', data);
  }

  public getUsers(url: string, filter?: GeoJsonFilter): Observable<UserResponse> {
    return super.get(url, filter).pipe(
      tap((response: any) => {
        this.totalUsers.next(response.meta.total);
      }),
    );
  }

  public getUserSettings(id: string) {
    const url = `${id}/settings`;
    return super.get(url);
  }

  public updateUserSettings(id: string, mediaId: number, photoUrl: string, settingsId?: number) {
    const config = settingsId ? `settings/${settingsId}` : 'settings';

    const configValue = {
      media_id: mediaId,
      photo_url: photoUrl,
    };

    const params = {
      config_key: 'profile_photo',
      config_value: configValue,
    };

    return super.update(id, params, config);
  }

  public postUserSettings(userId: string, params: any) {
    const config = `${userId}/settings`;
    return super.post(params, config);
  }

  public getUserById(id: string) {
    return super.get(id);
  }

  public updateUserById(id: number, params: any) {
    return super.update(id, params);
  }

  public createUser(data: any) {
    return super.post(data);
  }

  public deleteUser(id: number) {
    return super.delete(id);
  }
}
