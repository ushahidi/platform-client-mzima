import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GeoJsonFilter, GeoJsonPostsResponse, PostApiResponse, PostResult } from '@models';
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs';
import { EnvService } from './env.service';
import { ResourceService } from './resource.service';

export interface PostFilters {
  has_location?: string;
  order?: string;
  order_unlocked_on_top?: boolean;
  orderby?: string;
  'source[]'?: string[];
  'tags[]'?: number[];
  'status[]'?: string[];
  'form[]'?: string[];
  reactToFilters?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PostsService extends ResourceService<any> {
  private defaultPostsFilters: GeoJsonFilter = {
    order: 'desc',
    orderby: 'created',
    order_unlocked_on_top: true,
    reactToFilters: true,
    'source[]': [],
    'tags[]': [],
    'form[]': [],
    'status[]': ['published', 'draft'],
  };
  private postsFilters = new BehaviorSubject<any>(this.defaultPostsFilters);
  public postsFilters$ = this.postsFilters.asObservable();
  private totalPosts = new Subject<number>();
  public totalPosts$ = this.totalPosts.asObservable();
  private totalGeoPosts = new Subject<number>();
  public totalGeoPosts$ = this.totalGeoPosts.asObservable();

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
    return super
      .get('geojson', { has_location: 'mapped', ...filter, ...this.postsFilters.value })
      .pipe(
        tap((res) => {
          this.totalGeoPosts.next(res.total);
        }),
      );
  }

  public getPosts(url: string, filter?: GeoJsonFilter): Observable<PostApiResponse> {
    return super.get(url, { ...this.postsFilters.value, has_location: 'all', ...filter }).pipe(
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
      tap((response) => {
        this.totalPosts.next(response.total_count);
      }),
    );
  }

  public getPostStatistics(queryParams?: any) {
    return super.get(
      'stats',
      queryParams ?? {
        ...this.postsFilters.value,
        group_by: 'form',
        has_location: 'all',
        include_unmapped: true,
      },
    );
  }

  public applyFilters(filters: any): void {
    const newFilters: any = {};
    for (const key in filters) {
      if (filters[key] || this.postsFilters.value[key]) {
        newFilters[key] = filters[key] || this.postsFilters.value[key];
      }
    }
    this.postsFilters.next(newFilters);
  }
}
