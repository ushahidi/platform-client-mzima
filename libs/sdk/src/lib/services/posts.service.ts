import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  finalize,
  lastValueFrom,
  map,
  mergeMap,
  Observable,
  Subject,
  tap,
} from 'rxjs';
import { apiHelpers, generalHelpers } from '../helpers';
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
    'source[]': [],
    'tags[]': [],
    'form[]': [],
    'status[]': [],
  };
  private postsFilters = new BehaviorSubject<GeoJsonFilter>(this.defaultPostsFilters);
  public postsFilters$ = this.postsFilters.asObservable();
  private totalPosts = new Subject<number>();
  public totalPosts$ = this.totalPosts.asObservable();
  private totalGeoPosts = new Subject<number>();
  public totalGeoPosts$ = this.totalGeoPosts.asObservable();
  private isLoadingPosts = new Subject<boolean>();
  public isLoadingPosts$ = this.isLoadingPosts.asObservable();
  private responseObject: any;
  private awaitedResponse = new Subject<any>();
  public awaitedResponse$ = this.awaitedResponse.asObservable();

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

  public searchPosts(url: string, query?: string, params?: any): Observable<PostApiResponse> {
    return super.get(url, { has_location: 'all', q: query, ...params }).pipe(
      tap((response) => {
        this.totalPosts.next(response.meta.total);
      }),
    );
  }

  getGeojson(filter?: GeoJsonFilter): Observable<GeoJsonPostsResponse> {
    return super.get('geojson', this.postParamsMapper({ ...this.postsFilters.value }, filter)).pipe(
      tap((res) => {
        this.totalGeoPosts.next(res.meta.total);
      }),
    );
  }

  public getPosts(url: string, filter?: GeoJsonFilter): Observable<PostApiResponse> {
    return super
      .get(url, this.postParamsMapper({ ...this.postsFilters.value, has_location: 'all' }, filter))
      .pipe(
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
          // set response here to be used inside of finalize()
          this.responseObject = response;
        }),
        finalize(() => {
          this.isLoadingPosts.next(false);
          this.awaitedResponse.next(this.responseObject);
        }),
      );
  }

  public getMyPosts(url: string, filter?: GeoJsonFilter): Observable<PostApiResponse> {
    return super.get(url, this.postParamsMapper({ has_location: 'all', user: 'me' }, filter)).pipe(
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

  public getPostStatistics(queryParams?: any): Observable<PostStatsResponse> {
    const params = { ...queryParams, group_by: 'form', enable_group_by_source: true };
    const filters = this.postParamsMapper(params, this.postsFilters.value, true);

    return super.get('stats', filters);
  }

  private postParamsMapper(params: any, filter?: GeoJsonFilter, isStats: boolean = false) {
    // Combine new parameters with existing filter
    const postParams: any = { ...filter, ...params };

    // Some parameters should always come from the filter (if they exist)
    postParams.page = filter?.page ?? postParams.page;
    postParams.currentView = filter?.currentView ?? postParams.currentView;
    postParams.limit = filter?.limit ?? postParams.limit;

    postParams['status[]'] = filter?.['status[]'] ?? postParams['status[]'];
    if (
      postParams['form[]'] === undefined ||
      (postParams['form[]'].length === 0 && postParams['form'])
    )
      postParams['form[]'] = postParams['form'];
    if (
      postParams['status[]'] === undefined ||
      (postParams['status[]'].length === 0 && postParams['status'])
    )
      postParams['status[]'] = postParams['status'];
    if (
      postParams['source[]'] === undefined ||
      (postParams['source[]'].length === 0 && postParams['source'])
    )
      postParams['source[]'] = postParams['source'];
    if (postParams.tags?.length) {
      postParams['tags[]'] = postParams.tags;
    }

    // Allocate start and end dates, and remove originals
    if (params.date_before || params.date_after) {
      postParams.date_before = params.date_before;
      postParams.date_after = params.date_after;
    } else if (postParams.date?.start) {
      postParams.date_after = postParams.date.start;
      if (postParams.date.end) {
        postParams.date_before = postParams.date.end;
      }
      delete postParams.date;
    } else {
      delete postParams.date;
      if (!params.date_before) {
        delete postParams.date_before;
      }

      if (!params.date_after) {
        delete postParams.date_after;
      }
    }

    // Filter was reset
    if (!params.date && !params.date_before && !params.date_after) {
      delete postParams.date_before;
      delete postParams.date_after;
    }

    // Re-allocate location information
    if (postParams.center_point?.location?.lat) {
      postParams.within_km = postParams.center_point.distance;
      postParams.center_point = `${postParams.center_point.location.lat},${postParams.center_point.location.lng}`;
    } else if (!postParams.center_point?.length) {
      delete postParams.center_point;
    }

    // Clean up new params based on which view is currently active
    if (postParams.currentView === 'map') {
      postParams.has_location = 'mapped';
      postParams.include_unstructured_posts = false;
      delete postParams.order;
      delete postParams.orderby;
    } else if (postParams.currentView === 'feed') {
      postParams.include_unmapped = true;
      if (postParams['form[]']?.includes(0)) {
        postParams.include_unstructured_posts = true;
      } else {
        postParams.include_unstructured_posts = false;
      }
      delete postParams.has_location;
      delete postParams.within_km;
      delete postParams.place;
    }

    // Remove 'unknown form' from the form list if it exists.
    postParams['form[]'] = postParams['form[]']?.filter((formId: any) => formId !== 0);

    // Clean up whatevers left, removing empty arrays and values
    if (postParams['form[]']?.length === 0 || postParams['form[]'] === undefined) {
      postParams['form[]'] = ['none'];
    }

    if (isStats || postParams.currentView === 'myposts') {
      delete postParams['form[]'];
    }

    if (postParams['source[]']?.length === 0) {
      postParams['source[]'] = ['none'];
    }

    if (postParams['status[]']?.length === 0) {
      postParams['status[]'] = ['none'];
    }

    if (postParams['tags[]']?.length === 0) {
      delete postParams['tags[]'];
    }

    if (postParams.set?.length === 0) {
      delete postParams.set;
    }

    if (postParams.query?.length === 0) {
      delete postParams.query;
    }
    if (postParams.place?.length === 0) {
      delete postParams.place;
    }

    delete postParams.currentView;
    delete postParams.source;
    delete postParams.tags;
    delete postParams.status;
    delete postParams.form;
    delete postParams.reactToFilter;
    delete postParams.order_unlocked;

    for (const key in postParams) {
      if (postParams[key] === undefined) {
        delete postParams[key];
      }
    }

    return postParams;
  }

  public lockPost(id: string | number) {
    return super.update(id, null, 'lock');
  }

  public unlockPost(id: string | number) {
    return super.delete(id, 'lock');
  }

  isPostLockedForCurrentUser(post: any) {
    const currentUser = localStorage.getItem(`${generalHelpers.CONST.LOCAL_STORAGE_PREFIX}userId`);
    if (!currentUser) {
      return false;
    }
    if (post.locks.length > 0) {
      if (currentUser) {
        return parseInt(currentUser) !== parseInt(post.locks[0].user_id);
      } else {
        return false;
      }
    }
    return false;
  }

  public applyFilters(filters: any, updated = true): void {
    const newFilters: any = {};
    for (const key in filters) {
      const postsFilterValue = this.postsFilters.value[key as keyof typeof this.postsFilters.value];
      if (filters[key] !== undefined || postsFilterValue) {
        newFilters[key] = filters[key] !== undefined ? filters[key] : postsFilterValue;
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
