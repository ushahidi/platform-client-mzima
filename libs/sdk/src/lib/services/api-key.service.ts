import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { API_CONFIG_TOKEN, SdkConfig } from '../config';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class ApiKeyService extends ResourceService<any> {
  constructor(
    protected override httpClient: HttpClient,
    @Inject(API_CONFIG_TOKEN) config: SdkConfig,
  ) {
    super(httpClient, config);
  }

  getApiVersions(): string {
    return 'v3';
  }

  getResourceUrl(): string {
    return 'apikeys';
  }
}
