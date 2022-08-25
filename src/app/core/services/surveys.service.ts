import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments';
import { Observable } from 'rxjs';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class SurveysService extends ResourceService<any> {
  constructor(protected override httpClient: HttpClient) {
    super(httpClient);
  }

  getApiVersions(): string {
    return environment.api_v5;
  }

  getResourceUrl(): string {
    return 'surveys';
  }

  override get(): Observable<any> {
    return super.get();
  }

  override getById(id: string | number): Observable<any> {
    return super.getById(id);
  }
}
