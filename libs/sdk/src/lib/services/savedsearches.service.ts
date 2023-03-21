import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG_TOKEN, SdkConfig } from '../config';
import { ResourceService } from './resource.service';

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

  override get(): Observable<any> {
    return super.get();
  }

  override update(id: string | number, resource: any): Observable<any> {
    return super.update(id, resource);
  }

  override post(resource: any): Observable<any> {
    return super.post(resource);
  }

  override delete(id: string | number): Observable<any> {
    return super.delete(id);
  }
}
