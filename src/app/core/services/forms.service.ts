import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { FormAttributeInterface, FormInterface, FormTaskInterface } from '@models';
import { EnvService } from './env.service';
import { ResourceService } from './resource.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FormsService extends ResourceService<any> {
  constructor(protected override httpClient: HttpClient, protected override env: EnvService) {
    super(httpClient, env);
  }

  getApiVersions(): string {
    return this.env.environment.api_v3;
  }

  getResourceUrl(): string {
    return 'forms';
  }

  getFresh(): Observable<FormInterface[]> {
    return super.get().pipe(map((res) => res.results));
  }

  getStages(formId: string): Observable<FormTaskInterface[]> {
    return super.get(`${formId}/stages`).pipe(map((res) => res.results));
  }

  getAttributes(formId: string): Observable<FormAttributeInterface[]> {
    return super.get(`${formId}/attributes`).pipe(map((res) => res.results));
  }
}
