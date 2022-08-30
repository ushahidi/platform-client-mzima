import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from './env.service';

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  constructor(protected httpClient: HttpClient, protected envService: EnvService) {}

  uploadFile(file: File) {
    const apiUrl =
      this.envService.environment.backend_url + this.envService.environment.api_v3 + 'media';

    const formData = new FormData();
    formData.append('file', file);

    return this.httpClient.post(apiUrl, formData);
  }
}
