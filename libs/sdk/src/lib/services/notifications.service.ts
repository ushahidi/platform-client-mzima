import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiHelpers } from '../helpers';
import { EnvLoader } from '../loader';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService extends ResourceService<any> {
  constructor(
    protected override httpClient: HttpClient,
    protected override currentLoader: EnvLoader,
  ) {
    super(httpClient, currentLoader);
  }

  getApiVersions(): string {
    return apiHelpers.API_V_3;
  }

  getResourceUrl(): string {
    return 'notifications';
  }

  override get(set?: string): Observable<any> {
    const params: Record<string, string> = {
      user: 'me',
      ...(set && { set }),
    };
    return super.get('', params);
  }
}
