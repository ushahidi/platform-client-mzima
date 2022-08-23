import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments';
import { GeoJsonFilter, GeoJsonPostsResponse } from '@models';
import { Observable } from 'rxjs';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class PostsService extends ResourceService<any> {
  constructor(protected override httpClient: HttpClient) {
    super(httpClient);
  }

  getApiVersions(): string {
    return environment.api_v3;
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
    };
    return super.get('geojson', filter || test);
  }

  public getAllowedSurveys() {
    this.httpClient.get(`${environment.backend_url}api/v5/surveys/`).subscribe({
      next: (surveys) => {
        console.log('surveys: ', surveys);
      },
    });
  }
}
