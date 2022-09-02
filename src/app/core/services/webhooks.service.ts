import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WebhookApi, WebhookResult } from '@models';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class WebhooksService extends ResourceService<any> {
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
    return 'webhooks';
  }

  override get(): Observable<WebhookApi> {
    return super.get();
  }

  override getById(id: string | number): Observable<WebhookResult> {
    return super.getById(id);
  }

  override update(id: string | number, resource: any): Observable<WebhookResult> {
    return super.update(id, resource);
  }

  override delete(id: string | number): Observable<WebhookResult> {
    return super.delete(id);
  }
}
