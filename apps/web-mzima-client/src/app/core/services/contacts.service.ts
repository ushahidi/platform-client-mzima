import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContactsResponseInterface } from '@models';
import { EnvService } from './env.service';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class ContactsService extends ResourceService<any> {
  constructor(protected override httpClient: HttpClient, protected override env: EnvService) {
    super(httpClient, env);
  }

  getApiVersions(): string {
    return this.env.environment.api_v3;
  }

  getResourceUrl(): string {
    return 'contacts';
  }

  override get(data?: any): Observable<ContactsResponseInterface> {
    return super.get(undefined, data);
  }

  override post(data: any): Observable<ContactsResponseInterface> {
    return super.post(data);
  }

  override update(id: number | string, data: any): Observable<ContactsResponseInterface> {
    return super.update(id, data);
  }

  override delete(id: string | number): Observable<ContactsResponseInterface> {
    return super.delete(id);
  }
}
