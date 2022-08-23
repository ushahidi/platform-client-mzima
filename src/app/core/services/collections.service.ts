import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments';
import { Collection } from '@models';
import { Observable } from 'rxjs';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class CollectionsService extends ResourceService<Collection> {
  constructor(protected override httpClient: HttpClient) {
    super(httpClient);
  }

  getApiVersions(): string {
    return environment.api_v3;
  }

  getResourceUrl(): string {
    return 'collections';
  }

  getCollections(url: string, queryParams: any): Observable<Collection> {
    return super.get(url, queryParams);
  }
}
