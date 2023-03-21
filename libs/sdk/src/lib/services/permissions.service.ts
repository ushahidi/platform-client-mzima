import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { PermissionResult } from '../models';
import { Observable } from 'rxjs';
import { ResourceService } from './resource.service';
import { API_CONFIG_TOKEN, SdkConfig } from '../config';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService extends ResourceService<PermissionResult> {
  constructor(
    protected override httpClient: HttpClient,
    @Inject(API_CONFIG_TOKEN) config: SdkConfig,
  ) {
    super(httpClient, config);
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
