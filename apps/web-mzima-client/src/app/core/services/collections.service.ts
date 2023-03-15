import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Collection } from '@models';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class CollectionsService extends ResourceService<any> {
  constructor(protected override httpClient: HttpClient, protected override env: EnvService) {
    super(httpClient, env);
  }

  getApiVersions(): string {
    return this.env.environment.api_v3;
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
