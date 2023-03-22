import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { EnvLoader } from '../loader';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class PostsV5Service extends ResourceService<any> {
  constructor(
    protected override httpClient: HttpClient,
    protected override currentLoader: EnvLoader,
  ) {
    super(httpClient, currentLoader);
  }

  getApiVersions(): string {
    return 'api/v3/';
  }

  getResourceUrl(): string {
    return 'posts';
  }

  updateStatus(id: string | number, status: string) {
    return super.patch(id, { status });
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

  override post(params: any): Observable<any> {
    return super.post(params);
  }
  override update(postId: number, params: any): Observable<any> {
    return super.update(postId, params);
  }
}
