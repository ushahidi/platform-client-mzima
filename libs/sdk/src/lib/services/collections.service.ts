import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Collection } from '../models';
import { Observable } from 'rxjs';
import { API_CONFIG_TOKEN, SdkConfig } from '../config';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class CollectionsService extends ResourceService<any> {
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
    return 'collections';
  }

  getCollections(queryParams?: any): Observable<Collection> {
    return super.get('', queryParams);
  }

  addToCollection(collectionId: string | number, postId: string | number) {
    return super.post({ id: postId } as any, `${collectionId}/posts`);
  }

  removeFromCollection(collectionId: string | number, postId: string | number) {
    return super.delete(collectionId, `posts/${postId}`);
  }
}
