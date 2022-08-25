import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class ApiKeyService extends ResourceService<any> {
  constructor(protected override httpClient: HttpClient) {
    super(httpClient);
  }

  getApiVersions(): string {
    return environment.api_v3;
  }

  getResourceUrl(): string {
    return 'apikeys';
  }
}
