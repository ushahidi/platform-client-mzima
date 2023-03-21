import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContactsResponseInterface } from '../models';
import { ResourceService } from './resource.service';
import { API_CONFIG_TOKEN, SdkConfig } from '../config';

@Injectable({
  providedIn: 'root',
})
export class ContactsService extends ResourceService<any> {
  constructor(
    protected override httpClient: HttpClient,
    @Inject(API_CONFIG_TOKEN) config: SdkConfig,
  ) {
    super(httpClient, config);
  }

  getApiVersions(): string {
    return 'api/v3/';
  }

  getResourceUrl(): string {
    return 'contacts';
  }

  override get(data?: any): Observable<ContactsResponseInterface> {
    return super.get(undefined, data);
  }
}
