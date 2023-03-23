import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { apiHelpers } from '../helpers';
import { EnvLoader } from '../loader';
import { FormAttributeInterface, FormInterface, FormsResponse, FormTaskInterface } from '../models';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class FormsService extends ResourceService<any> {
  constructor(
    protected override httpClient: HttpClient,
    protected override currentLoader: EnvLoader,
  ) {
    super(httpClient, currentLoader);
  }

  getApiVersions(): string {
    return apiHelpers.API_V_3;
  }

  getResourceUrl(): string {
    return 'forms';
  }

  override get(url?: string | undefined, queryParams?: any): Observable<FormsResponse> {
    return super.get(url, queryParams);
  }

  getFresh(): Observable<FormInterface[]> {
    return super.get().pipe(map((res) => res.results));
  }

  getStages(formId: string): Observable<FormTaskInterface[]> {
    return super.get(`${formId}/stages`).pipe(map((res) => res.results));
  }

  getAttributes(formId: string, queryParams?: any): Observable<FormAttributeInterface[]> {
    return super.get(`${formId}/attributes`, queryParams).pipe(map((res) => res.results));
  }

  updateRoles(formId: string, roles: any[]): Observable<any[]> {
    return super.update(`${formId}/roles`, { formId, roles }).pipe(map((res) => res.results));
  }

  getRoles(formId: string, queryParams?: any): Observable<any[]> {
    return super.get(`${formId}/roles`, queryParams).pipe(map((res) => res.results));
  }
}
