import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { WebhookApiInterface, WebhookResultInterface } from '../models';
import { Observable, Subject } from 'rxjs';
import { ResourceService } from './resource.service';
import { API_CONFIG_TOKEN, SdkConfig } from '../config';

@Injectable({
  providedIn: 'root',
})
export class WebhooksService extends ResourceService<any> {
  private _changeWebhookState = new Subject<any>();
  readonly changeWebhookState$ = this._changeWebhookState.asObservable();

  constructor(
    protected override httpClient: HttpClient,
    @Inject(API_CONFIG_TOKEN) config: SdkConfig,
  ) {
    super(httpClient, config);
  }

  setState(value: boolean) {
    this._changeWebhookState.next(value);
  }

  getApiVersions(): string {
    return 'api/v3/';
  }

  getResourceUrl(): string {
    return 'webhooks';
  }

  override get(): Observable<WebhookApiInterface> {
    return super.get();
  }

  override getById(id: string): Observable<WebhookResultInterface> {
    return super.getById(id);
  }

  override update(id: string | number, resource: any): Observable<WebhookResultInterface> {
    return super.update(id, resource);
  }

  override delete(id: string | number): Observable<WebhookResultInterface> {
    return super.delete(id);
  }

  override post(resource: any): Observable<any> {
    return super.post(resource);
  }
}
