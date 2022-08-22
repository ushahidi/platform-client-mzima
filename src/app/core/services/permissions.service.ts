import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments';
import { PermissionResult } from '@models';
import { Observable } from 'rxjs';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService extends ResourceService<PermissionResult> {
  constructor(protected override httpClient: HttpClient) {
    super(httpClient);
  }

  getApiVersions(): string {
    return environment.api_v3;
  }

  getResourceUrl(): string {
    return 'permissions';
  }

  override get(): Observable<any> {
    return super.get();
  }
}
