import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments';

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  constructor(protected httpClient: HttpClient) {}

  uploadFile(file: File) {
    const apiUrl = environment.backend_url + environment.api_v3 + 'media';

    const formData = new FormData();
    formData.append('file', file);

    return this.httpClient.post(apiUrl, formData);
  }
}
