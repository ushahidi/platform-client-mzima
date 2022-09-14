import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class DataSourcesService extends ResourceService<any> {
  constructor(
    protected override httpClient: HttpClient, //
    protected override env: EnvService,
  ) {
    super(httpClient, env);
  }

  getApiVersions(): string {
    return this.env.environment.api_v3;
  }

  getResourceUrl(): string {
    return 'dataproviders';
  }

  override get(): Observable<any> {
    return super.get();
  }
}
