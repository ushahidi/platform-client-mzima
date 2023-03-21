import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { API_CONFIG_TOKEN, SdkConfig } from '../config';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService extends ResourceService<any> {
  constructor(
    protected override httpClient: HttpClient,
    @Inject(API_CONFIG_TOKEN) config: SdkConfig,
  ) {
    super(httpClient, config);
  }

  getApiVersions(): string {
    return 'api/v5/';
  }

  getResourceUrl(): string {
    return 'categories';
  }
}
