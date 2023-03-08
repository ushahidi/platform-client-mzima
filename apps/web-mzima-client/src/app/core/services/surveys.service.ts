import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SurveyApiResponse, SurveyItem } from '@models';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class SurveysService extends ResourceService<any> {
  constructor(
    protected override httpClient: HttpClient, //
    protected override env: EnvService,
  ) {
    super(httpClient, env);
  }

  getApiVersions(): string {
    return this.env.environment.api_v5;
  }

  getResourceUrl(): string {
    return 'surveys';
  }

  saveSurvey(survey: SurveyItem, surveyId?: string) {
    if (surveyId) {
      return super.update(surveyId, survey);
    } else {
      return super.post(survey);
    }
  }

  override get(): Observable<SurveyApiResponse> {
    return super.get();
  }

  override getById(id: string | number): Observable<any> {
    return super.getById(id);
  }

  override delete(id: string | number): Observable<any> {
    return super.delete(id);
  }
}
