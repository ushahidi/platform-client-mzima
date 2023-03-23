import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiHelpers } from '../helpers';
import { EnvLoader } from '../loader';
import { PermissionResult } from '../models';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class MediaService extends ResourceService<PermissionResult> {
  constructor(
    protected override httpClient: HttpClient,
    protected override currentLoader: EnvLoader,
  ) {
    super(httpClient, currentLoader);
  }

  getApiVersions(): string {
    return apiHelpers.API_V_3;
  }

  getResourceUrl(): string {
    return 'media';
  }

  uploadFile(file: File) {
    const apiUrl = this.backendUrl + this.getApiVersions() + this.getResourceUrl();

    const formData = new FormData();
    formData.append('file', file);

    return this.httpClient.post(apiUrl, formData);
  }

  override getById(id: string | number): Observable<any> {
    return this.httpClient.get(`https://api-2022.uchaguzi.or.ke/api/v3/media/${id}`);
  }
}
