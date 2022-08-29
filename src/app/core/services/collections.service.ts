import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Collection } from '@models';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class CollectionsService extends ResourceService<Collection> {
  constructor(protected override httpClient: HttpClient, protected override env: EnvService) {
    super(httpClient, env);
  }

  getApiVersions(): string {
    return this.env.environment.api_v3;
  }

  getResourceUrl(): string {
    return 'collections';
  }

  getCollections(url: string, queryParams: any): Observable<Collection> {
    return super.get(url, queryParams);
  }
}
