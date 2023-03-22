import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { EnvLoader } from '../loader';
import { WebhookApiInterface, WebhookResultInterface } from '../models';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class WebhooksService extends ResourceService<any> {
  private _changeWebhookState = new Subject<any>();
  readonly changeWebhookState$ = this._changeWebhookState.asObservable();

  constructor(
    protected override httpClient: HttpClient,
    protected override currentLoader: EnvLoader,
  ) {
    super(httpClient, currentLoader);
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
