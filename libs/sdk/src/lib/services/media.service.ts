import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiHelpers } from '../helpers';
import { EnvLoader } from '../loader';
// import { MediaResponse } from '../models';
import { ResourceService } from './resource.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MediaService extends ResourceService<any> {
  constructor(
    protected override httpClient: HttpClient,
    protected override currentLoader: EnvLoader,
  ) {
    super(httpClient, currentLoader);
  }

  // type progressFunction

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

  uploadFileProgress(file: File, caption?: string): Observable<HttpEvent<any>> {
    const apiUrl = this.backendUrl + this.getApiVersions() + this.getResourceUrl();

    const formData = new FormData();
    formData.append('file', file);
    if (caption) {
      formData.append('caption', caption);
    }

    return this.httpClient.post(apiUrl, formData, { reportProgress: true, observe: 'events' });
  }

  updateCaption(id: string | number, caption: string) {
    return super.patch(id, { caption });
  }
}
