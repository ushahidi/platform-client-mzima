import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PermissionResult } from '../models';
import { ResourceService } from './resource.service';
import { API_CONFIG_TOKEN, SdkConfig } from '../config';

@Injectable({
  providedIn: 'root',
})
export class MediaService extends ResourceService<PermissionResult> {
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
    return 'media';
  }

  uploadFile(file: File) {
    const apiUrl = this.config.url + this.getApiVersions() + this.getResourceUrl();

    const formData = new FormData();
    formData.append('file', file);

    return this.httpClient.post(apiUrl, formData);
  }

  override getById(id: string | number): Observable<any> {
    return this.httpClient.get(`https://api-2022.uchaguzi.or.ke/api/v3/media/${id}`);
  }
}
