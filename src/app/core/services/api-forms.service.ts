import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SurveyItemTaskFieldApiResponse } from '@models';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class ApiFormsService extends ResourceService<any> {
  constructor(protected override httpClient: HttpClient, protected override env: EnvService) {
    super(httpClient, env);
  }

  getApiVersions(): string {
    return this.env.environment.api_v3;
  }

  getResourceUrl(): string {
    return 'forms';
  }

  getFormSurveyAttributes(
    id: number,
    queryParams: any,
  ): Observable<SurveyItemTaskFieldApiResponse> {
    const url = `${id}/attributes`;
    return super.get(url, queryParams);
  }
}
