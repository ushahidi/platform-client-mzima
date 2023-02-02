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
  set: string;
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
    set: '',
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

  override update(id: string | number, resource: any): Observable<any> {
    return super.update(id, resource);
  }

  override delete(id: string | number): Observable<any> {
    return super.delete(id);
  }

  getGeojson(filter?: GeoJsonFilter): Observable<GeoJsonPostsResponse> {
    const tmpParams = { ...this.postsFilters.value, has_location: 'mapped', ...filter };

    return super.get('geojson', this.postParamsMapper(tmpParams)).pipe(
      tap((res) => {
        this.totalGeoPosts.next(res.total);
      }),
    );
  }

  public getPosts(url: string, filter?: GeoJsonFilter): Observable<PostApiResponse> {
    const tmpParams = { ...this.postsFilters.value, has_location: 'all', ...filter };
    return super.get(url, this.postParamsMapper(tmpParams)).pipe(
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

  private postParamsMapper(params: any) {
    // TODO: REWORK THIS!! Created to make current API work as expected
    if (params.date?.start) {
      params.date_after = params.date.start;
      params.date_before = params.date.end;
      delete params.date;
    } else {
      delete params.date;
    }

    if (params.center_point?.location?.lat) {
      params.within_km = params.center_point.distance;
      params.center_point = `${params.center_point.location.lat},${params.center_point.location.lng}`;
    } else {
      delete params.center_point;
    }

    if (!params.set) {
      delete params.set;
    }

    if (params.form && params.form[0] === 'none') {
      delete params.form;
    }

    if (params['form[]'] && params['form[]'][0] === 'none') {
      delete params['form[]'];
    }

    if (params.status?.length) {
      params['status[]'] = params.status;
      delete params.status;
    }
    if (params.source?.length) {
      params['source[]'] = params.source;
      delete params.source;
    }

    if (params.tags?.length) {
      params['tags[]'] = params.tags;
      delete params.tags;
    }

    return params;
  }

  public getPostStatistics(queryParams?: any) {
    const filters = { ...this.postsFilters.value };

    return super.get(
      'stats',
      queryParams ?? {
        ...this.postParamsMapper(filters),
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

  public setSorting(sorting: any): void {
    this.postsFilters.next({
      ...this.postsFilters.value,
      ...sorting,
    });
  }
}
