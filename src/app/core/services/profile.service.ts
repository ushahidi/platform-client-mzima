import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProfileResponseInterface } from '@models';
import { EnvService } from './env.service';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService extends ResourceService<any> {
  constructor(protected override httpClient: HttpClient, protected override env: EnvService) {
    super(httpClient, env);
  }

  getApiVersions(): string {
    return this.env.environment.api_v3;
  }

  getResourceUrl(): string {
    return 'users';
  }

  override get(): Observable<ProfileResponseInterface> {
    return super.get('me');
  }

  override update(data: any): Observable<ProfileResponseInterface> {
    return super.update('me', data);
  }
}
