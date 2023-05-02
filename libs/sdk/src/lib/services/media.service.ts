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

  uploadFile(file: File, caption?: string) {
    const apiUrl = this.backendUrl + this.getApiVersions() + this.getResourceUrl();

    const formData = new FormData();
    formData.append('file', file);
    if (caption) {
      formData.append('caption', caption);
    }

    return this.httpClient.post(apiUrl, formData);
  }

  override getById(id: string): Observable<any> {
    return super.get(id);
  }
}
