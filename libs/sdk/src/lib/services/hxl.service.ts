import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiHelpers } from '../helpers';
import { EnvLoader } from '../loader';
import { HXLLicenseInterface, HXLMetadataInterface, HXLMetadataResponse } from '../models';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class HXLService extends ResourceService<any> {
  constructor(
    protected override httpClient: HttpClient,
    protected override currentLoader: EnvLoader,
  ) {
    super(httpClient, currentLoader);
  }

  getMetadata(queryParams?: any): Observable<HXLMetadataResponse> {
    return super.get('metadata', queryParams);
  }

  addMetadata(metadata: HXLMetadataInterface): Observable<any> {
    return super.post(metadata, 'metadata');
  }

  getLicenses(queryParams?: any): Observable<{ results: HXLLicenseInterface[] }> {
    return super.get('licenses', queryParams);
  }

  getTags(queryParams?: any): Observable<any> {
    return super.get('tags', queryParams);
  }

  getApiVersions(): string {
    return apiHelpers.API_V_5;
  }

  getResourceUrl(): string {
    return 'hxl';
  }
}
