import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiHelpers } from '../helpers';
import { EnvLoader } from '../loader';
import { Savedsearch, SavedsearchesResponse } from '../models';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class SavedsearchesService extends ResourceService<any> {
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
    return 'savedsearches';
  }

  override get(): Observable<SavedsearchesResponse> {
    return super.get();
  }

  override getById(id: string | number): Observable<{ result: Savedsearch }> {
    return super.getById(id);
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
