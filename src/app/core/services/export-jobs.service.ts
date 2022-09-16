import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExportJobInterface, ExportJobsResponse } from '@models';
import { EnvService } from './env.service';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class ExportJobsService extends ResourceService<any> {
  constructor(protected override httpClient: HttpClient, protected override env: EnvService) {
    super(httpClient, env);
  }

  getApiVersions(): string {
    return this.env.environment.api_v3;
  }

  getResourceUrl(): string {
    return 'exports/jobs';
  }

  save(job: Partial<ExportJobInterface>) {
    return super.post(job);
  }

  override getById(id: string | number): Observable<ExportJobInterface> {
    return super.getById(id);
  }

  override get(url?: string | undefined, queryParams?: any): Observable<ExportJobsResponse> {
    return super.get(url, queryParams);
  }

  override delete(id: string | number): Observable<any> {
    return super.delete(id);
  }
}
