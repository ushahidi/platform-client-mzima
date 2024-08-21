import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiHelpers } from '../helpers';
import { EnvLoader } from '../loader';
import { Collection, CollectionResult } from '../models';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class CollectionsService extends ResourceService<any> {
  constructor(
    protected override httpClient: HttpClient,
    protected override currentLoader: EnvLoader,
  ) {
    super(httpClient, currentLoader);
  }

  getApiVersions(): string {
    return apiHelpers.API_V_5;
  }

  getResourceUrl(): string {
    return 'collections';
  }

  override getById(id: string | number): Observable<{ result: CollectionResult }> {
    return super.getById(id);
  }

  getCollections(queryParams?: any): Observable<Collection> {
    return super.get('', queryParams);
  }
  getCollection(collectionId: string): Observable<Collection> {
    return super.get(collectionId);
  }
  addToCollection(collectionId: string | number, postId: string | number) {
    return super.post({ post_id: postId } as any, `${collectionId}/posts`);
  }

  removeFromCollection(collectionId: string | number, postId: string | number) {
    return super.delete(collectionId, `posts/${postId}`);
  }
}
