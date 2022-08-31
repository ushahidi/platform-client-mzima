import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService extends ResourceService<any> {
  constructor(protected override httpClient: HttpClient, protected override env: EnvService) {
    super(httpClient, env);
  }

  getApiVersions(): string {
    return environment.api_v5;
  }

  getResourceUrl(): string {
    return 'categories';
  }

  override get(): Observable<any> {
    return super.get();
  }

  override post(data: any): Observable<any> {
    return super.post(data);
  }

  override update(id: string, data: any): Observable<any> {
    return super.update(id, data);
  }

  override delete(id: string | number): Observable<any> {
    return super.delete(id);
  }
}
