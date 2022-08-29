import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PermissionResult } from '@models';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService extends ResourceService<PermissionResult> {
  constructor(protected override httpClient: HttpClient, protected override env: EnvService) {
    super(httpClient, env);
  }

  getApiVersions(): string {
    return this.env.environment.api_v3;
  }

  getResourceUrl(): string {
    return 'permissions';
  }

  override get(): Observable<any> {
    return super.get();
  }
}
