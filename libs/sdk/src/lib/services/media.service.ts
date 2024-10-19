import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { apiHelpers } from '../helpers';
import { EnvLoader } from '../loader';
// import { MediaResponse } from '../models';
import { ResourceService } from './resource.service';
import { map, Observable } from 'rxjs';

interface HttpResult {
  result: {
    original_file_url: any;
  };
}

@Injectable({
  providedIn: 'root',
})
export class MediaService extends ResourceService<any> {
  private domainPrefix: string = '';

  constructor(
    protected override httpClient: HttpClient,
    protected override currentLoader: EnvLoader,
    private sanitizer: DomSanitizer,
  ) {
    super(httpClient, currentLoader);
    this.domainPrefix = this.backendUrl.substring(0, this.backendUrl.length - 1);
  }

  // type progressFunction

  getApiVersions(): string {
    return apiHelpers.API_V_5;
  }

  getResourceUrl(): string {
    return 'media';
  }

  override getById(id: string | number): Observable<any> {
    return this.httpClient.get<any>(`${this.apiUrl}/${id}`, this.options).pipe(
      map((response) => {
        // If we get back only a relative url for a media request, add the backend domain to it
        // but we also need to sanitize it to prevent angular thinking we're xssing
        if (response.result.original_file_url) {
          response.result.original_file_url = this.cleanUrl(response.result.original_file_url);
        }
        return this.fromServerModel(response);
      }),
    );
  }

  uploadFile(file: File, caption?: string) {
    const apiUrl = this.backendUrl + this.getApiVersions() + this.getResourceUrl();

    const formData = new FormData();
    formData.append('file', file);
    if (caption) {
      formData.append('caption', caption);
    }

    return this.httpClient.post(apiUrl, formData).pipe(
      map((response) => {
        // if (response.body.result.original_file_url)
        //   response.body.result.original_file_url = this.cleanUrl(response.body.result.original_file_url);
        return response;
      }),
    );
  }

  private cleanUrl(url: string): SafeUrl {
    if (url[0] === '/') {
      url = this.domainPrefix + url;
    }
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  uploadFileProgress(file: File, caption?: string): Observable<any> {
    const apiUrl = this.backendUrl + this.getApiVersions() + this.getResourceUrl();

    const formData = new FormData();
    formData.append('file', file);
    if (caption) {
      formData.append('caption', caption);
    }

    return this.httpClient
      .post<HttpResult>(apiUrl, formData, { reportProgress: true, observe: 'events' })
      .pipe(
        map((response) => {
          if (response instanceof HttpResponse) {
            if (response.body?.result.original_file_url) {
              response.body.result.original_file_url = this.cleanUrl(
                response.body.result.original_file_url,
              );
            }
          }
          return response;
        }),
      );
  }

  updateCaption(id: string | number, caption: string) {
    return super.patch(id, { caption });
  }
}
