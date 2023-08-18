import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiHelpers } from '../helpers';
import { EnvLoader } from '../loader';
import { MediaResponse } from '../models';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class MediaService extends ResourceService<MediaResponse> {
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
}
