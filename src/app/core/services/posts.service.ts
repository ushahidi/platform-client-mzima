import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GeoJsonFilter, GeoJsonPostsResponse, PostApiResponse } from '@models';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class PostsService extends ResourceService<any> {
  constructor(protected override httpClient: HttpClient, protected override env: EnvService) {
    super(httpClient, env);
  }

  getApiVersions(): string {
    return this.env.environment.api_v3;
  }

  getResourceUrl(): string {
    return 'posts';
  }

  override getById(id: string | number): Observable<any> {
    return super.getById(id);
  }

  getGeojson(filter?: GeoJsonFilter): Observable<GeoJsonPostsResponse> {
    const test = {
      has_location: 'mapped',
      limit: 200,
      offset: 0,
      order: 'desc',
      order_unlocked_on_top: true,
      orderby: 'created',
      reactToFilters: true,
      'source[]': ['sms', 'twitter', 'web', 'email', 'published', 'draft'],
    };
    return super.get('geojson', filter || test);
  }

  public getPosts(url: string, queryParams: any): Observable<PostApiResponse> {
    return super.get(url, queryParams);
  }

  public getPostStatistics(queryParams: any) {
    return super.get('stats', queryParams);
  }
}
