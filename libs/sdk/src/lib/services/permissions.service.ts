import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvLoader } from '../loader';
import { PermissionResult } from '../models';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService extends ResourceService<PermissionResult> {
  constructor(
    protected override httpClient: HttpClient,
    protected override currentLoader: EnvLoader,
  ) {
    super(httpClient, currentLoader);
  }

  getApiVersions(): string {
    return 'api/v3/';
  }

  getResourceUrl(): string {
    return 'permissions';
  }

  override get(): Observable<any> {
    return super.get();
  }
}
