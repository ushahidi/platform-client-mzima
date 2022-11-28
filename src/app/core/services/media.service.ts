import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PermissionResult } from '../interfaces/permission.interface';
import { EnvService } from './env.service';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class MediaService extends ResourceService<PermissionResult> {
  constructor(protected override httpClient: HttpClient, protected override env: EnvService) {
    super(httpClient, env);
  }

  getApiVersions(): string {
    return this.env.environment.api_v3;
  }

  getResourceUrl(): string {
    return 'media';
  }

  uploadFile(file: File) {
    const apiUrl = this.env.environment.backend_url + this.env.environment.api_v3 + 'media';

    const formData = new FormData();
    formData.append('file', file);

    return this.httpClient.post(apiUrl, formData);
  }

  override getById(id: string | number): Observable<any> {
    return this.httpClient.get(`https://api-2022.uchaguzi.or.ke/api/v3/media/${id}`);
  }
}
