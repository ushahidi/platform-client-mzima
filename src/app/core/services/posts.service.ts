import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GeoJsonFilter, GeoJsonPostsResponse, PostApiResponse, PostResult } from '@models';
import { map, Observable } from 'rxjs';
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
    return super.getById(id).pipe(
      map((response) => {
        const source =
          response.source === 'sms'
            ? 'SMS'
            : response.source
            ? response.source.charAt(0).toUpperCase() + response.source.slice(1)
            : 'Web';
        return {
          ...response,
          source,
        };
      }),
    );
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
    return super.get(url, queryParams).pipe(
      map((response) => {
        response.results.map((post: PostResult) => {
          post.source =
            post.source === 'sms'
              ? 'SMS'
              : post.source
              ? post.source.charAt(0).toUpperCase() + post.source.slice(1)
              : 'Web';
        });

        return response;
      }),
    );
  }

  public getPostStatistics(queryParams: any) {
    return super.get('stats', queryParams);
  }
}
