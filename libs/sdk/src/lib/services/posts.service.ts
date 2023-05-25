import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs';
import { apiHelpers } from '../helpers';
import { EnvLoader } from '../loader';
import {
  GeoJsonFilter,
  GeoJsonPostsResponse,
  PostApiResponse,
  PostResult,
  PostStatsResponse,
} from '../models';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class PostsService extends ResourceService<any> {
  private defaultPostsFilters: GeoJsonFilter = {
    // order: 'desc',
    // orderby: 'created',
    // set: '',
    // order_unlocked_on_top: true,
    // reactToFilters: true,
    'source[]': ['web', 'twitter'],
    'tags[]': [],
    'form[]': ['2', '3', '4', '5'],
    'status[]': [],
  };
  private postsFilters = new BehaviorSubject<any>(this.defaultPostsFilters);
  public postsFilters$ = this.postsFilters.asObservable();
  private totalPosts = new Subject<number>();
  public totalPosts$ = this.totalPosts.asObservable();
  private totalGeoPosts = new Subject<number>();
  public totalGeoPosts$ = this.totalGeoPosts.asObservable();

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
    return 'posts';
  }

  updateStatus(id: string | number, status: string) {
    return super.patch(id, { status });
  }

  override post(params: any): Observable<any> {
    return super.post(params);
  }

  override update(postId: string | number, params: any): Observable<any> {
    return super.update(postId, params);
  }

  override getById(id: string | number): Observable<any> {
    return super.getById(id).pipe(
      map((response) => {
        const source =
          response.result.source === 'sms'
            ? 'SMS'
            : response.result.source
            ? response.result.source.charAt(0).toUpperCase() + response.result.source.slice(1)
            : 'Web';
        return {
          ...response.result,
          source,
        };
      }),
    );
  }

  override delete(id: string | number): Observable<any> {
    return super.delete(id);
  }

  getGeojson(filter?: GeoJsonFilter): Observable<GeoJsonPostsResponse> {
    const tmpParams = { ...this.postsFilters.value, has_location: 'mapped', ...filter };
    return super.get('geojson', this.postParamsMapper(tmpParams)).pipe(
      tap((res) => {
        this.totalGeoPosts.next(res.meta.total);
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
        this.totalPosts.next(response.meta.total);
      }),
    );
  }

  private postParamsMapper(params: any) {
    // TODO: REWORK THIS!! Created to make current API work as expected
    if (params.date?.start) {
      params.date_after = params.date.start;
      if (params.date.end) {
        params.date_before = params.date.end;
      }
      delete params.date;
    } else {
      delete params.date;
    }

    if (params.center_point?.location?.lat) {
      params.within_km = params.center_point.distance;
      params.center_point = `${params.center_point.location.lat},${params.center_point.location.lng}`;
    } else if (!params.center_point?.length) {
      delete params.center_point;
    }

    if (!params.set) {
      delete params.set;
    }

    if (params.form && params.form.length === 0) {
      params.form.push('none');
    }

    if (params['form[]']?.length === 0) {
      params['form[]'].push('none');
    }

    if (params['source[]']?.length === 0) {
      params['source[]'].push('none');
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

  public getPostStatistics(queryParams?: any): Observable<PostStatsResponse> {
    const filters = { ...this.postsFilters.value };

    delete filters.form;
    delete filters['form[]'];
    delete filters.source;
    delete filters['source[]'];

    return super.get(
      'stats',
      queryParams ?? {
        ...this.postParamsMapper(filters),
        group_by: 'form',
        enable_group_by_source: true,
        has_location: 'all',
        include_unmapped: true,
      },
    );
  }

  public lockPost(id: string | number) {
    return super.update(id, null, 'lock');
  }

  public unlockPost(id: string | number) {
    return super.delete(id, 'lock');
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
