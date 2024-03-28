import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom, map, mergeMap, Observable, Subject, tap } from 'rxjs';
import { apiHelpers } from '../helpers';
import { EnvLoader } from '../loader';
import {
  GeoJsonFilter,
  GeoJsonPostsResponse,
  PostApiResponse,
  PostContent,
  PostContentField,
  PostResult,
  PostStatsResponse,
} from '../models';
import { MediaService } from './media.service';
import { ResourceService } from './resource.service';

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
    include_unstructured_posts: true,
    'source[]': [],
    'tags[]': [],
    'form[]': [],
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
    private mediaService: MediaService,
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

  override getById(id: string | number): Observable<PostResult> {
    return super.getById(id).pipe(
      mergeMap(async (response) => {
        const source =
          response.result.source === 'sms'
            ? 'SMS'
            : response.result.source
            ? response.result.source.charAt(0).toUpperCase() + response.result.source.slice(1)
            : 'Web';

        for (const content of response.result.post_content as PostContent[]) {
          await this.preparingMediaField(content.fields);
        }

        return {
          ...response.result,
          source,
        };
      }),
    );
  }

  private async preparingMediaField(fields: PostContentField[]): Promise<void> {
    const promises = fields
      .filter((field: any) => field.type === 'media')
      .map(async (mediaField) => {
        if (mediaField.value && mediaField.value?.value) {
          try {
            const uploadObservable: any = await this.mediaService.getById(mediaField.value.value);
            const media: any = await lastValueFrom(uploadObservable);

            const { original_file_url: originalFileUrl, caption } = media.result;
            mediaField.value.mediaSrc = originalFileUrl;
            mediaField.value.mediaCaption = caption;
          } catch (e) {
            mediaField.value.mediaSrc = null;
            mediaField.value.mediaCaption = null;
          }
        }
      });

    await Promise.all(promises);
  }

  override delete(id: string | number): Observable<any> {
    return super.delete(id);
  }

  getGeojson(filter?: GeoJsonFilter): Observable<GeoJsonPostsResponse> {
    const tmpParams = { ...this.postsFilters.value, has_location: 'mapped', ...filter };
    delete tmpParams.order;
    delete tmpParams.orderby;
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

  public getMyPosts(url: string, filter?: GeoJsonFilter): Observable<PostApiResponse> {
    const tmpParams = { has_location: 'all', user: 'me', ...filter };
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
    );
  }

  public searchPosts(url: string, query?: string, params?: any): Observable<PostApiResponse> {
    return super.get(url, { has_location: 'all', q: query, ...params }).pipe(
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

    if (params.form?.length) {
      params['form[]'] = params.form;
      delete params.form;
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

  public getPostStatistics(
    queryParams?: any,
    isMapView: boolean = false,
  ): Observable<PostStatsResponse> {
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
        has_location: isMapView ? 'mapped' : 'all',
        include_unmapped: true,
        include_unstructured_posts: true,
      },
    );
  }

  public lockPost(id: string | number) {
    return super.update(id, null, 'lock');
  }

  public unlockPost(id: string | number) {
    return super.delete(id, 'lock');
  }

  public applyFilters(filters: any, updated = true): void {
    const newFilters: any = {};
    for (const key in filters) {
      if (filters[key] || this.postsFilters.value[key]) {
        newFilters[key] = filters[key] || this.postsFilters.value[key];
      }
    }
    if (updated) {
      this.postsFilters.next(newFilters);
    }
  }

  public setSorting(sorting: any): void {
    this.postsFilters.next({
      ...this.postsFilters.value,
      ...sorting,
    });
  }

  public normalizeFilter(values: any) {
    if (!values) return {};

    const filters = {
      ...values,
      'form[]': values.form,
      'source[]': values.source,
      'status[]': values.status,
      'tags[]': values.tags,
    };

    delete filters.form;
    delete filters.source;
    delete filters.status;
    delete filters.tags;
    return filters;
  }
}
