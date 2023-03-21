import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Savedsearch, SavedsearchesResponse } from '../models';
import { Observable } from 'rxjs';
import { ResourceService } from './resource.service';
import { API_CONFIG_TOKEN, SdkConfig } from '../config';

@Injectable({
  providedIn: 'root',
})
export class SavedsearchesService extends ResourceService<any> {
  constructor(
    protected override httpClient: HttpClient,
    @Inject(API_CONFIG_TOKEN) config: SdkConfig,
  ) {
    super(httpClient, config);
  }

  getApiVersions(): string {
    return 'api/v3/';
  }

  getResourceUrl(): string {
    return 'savedsearches';
  }

  override get(): Observable<SavedsearchesResponse> {
    return super.get();
  }

  override update(id: string | number, resource: Savedsearch): Observable<SavedsearchesResponse> {
    return super.update(id, resource);
  }

  override post(resource: Savedsearch): Observable<SavedsearchesResponse> {
    return super.post(resource);
  }

  override delete(id: string | number): Observable<SavedsearchesResponse> {
    return super.delete(id);
  }
}
